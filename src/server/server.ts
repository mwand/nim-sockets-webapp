import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import PlayerList from "./PlayerList";
import NimGame from "./NimGame";
import { Player, PlayerID } from "../shared/types";
import { nanoid } from 'nanoid';
import { start } from "repl";




// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

// get this working first, then refactor into a controller...

const httpServer = createHttpServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams });

// `game` is the single source of truth for the game state
const game = new NimGame(20, 3);
let gameNumber = 0

let serverGamesRemaining = 100;

console.log('server setting up event handlers')
setupEventHandlers(io);
console.log('server.ts: Listening on port 8080')
console.log('server.ts: clientNames', game.playerNames)
httpServer.listen(8080);

// dunno why io has to be 'any'
function setupEventHandlers
    (io: Server<ClientToServerEvents, ServerToClientEvents>) {
    //(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    console.log('server.ts: Setting up event handlers')
    // here io has an any type.  It should be something like ServerSocket
    // if a client is running
    io.on("connection", (socket: ServerSocket) => {

        // receive a message from the client 
        socket.on("helloFromClient",
            (clientName: string) => {
                console.log('\nserver received helloFromClient', clientName)
                const playerID = nanoid(6);
                game.addPlayer({ name: clientName, playerID: playerID, socket: socket });
                console.log(`server.ts: ${clientName} assigned ID ${playerID}`)
                socket.emit('assignID', playerID);
                console.log('server.ts: clientNames', game.playerNames)
                // io.emit('serverAnnounceNewClient', clientName);
                if ((game.nPlayers > 1) && !game.isGameInProgress) {
                    startGame();
                }
            })

        // client takes a turn
        // we know which client this is: it's the one at the other end of the socket
        socket.on("clientTakesMove",
            (move: number) => {
                const player = getPlayerFromSocket(socket) as Player;
                console.log('\nserver received clientMove', player.name, move)
                // console.log('server.ts: movesLeft = ', movesLeft)
                // console.log('game.currentPlayer', game.currentPlayer?.name, game.currentPlayer?.playerID)
                try {
                    // console.log('entering try block')
                    game.move(player, move);  // throws an error if the move is invalid
                    console.log('server.ts: sticks left', game.getPile())
                    if (game.isGameOver) {
                        handleGameOver(player, move)
                    }
                    else { requestNextMove(socket) }
                }
                catch (errMsg: any) {
                    console.log('server.ts: clientTakesMove error', player.name, move, errMsg.message)
                    requestNextMove(socket)
                }
            }
        )
        // Does this work??
        socket.on("disconnect", () => {
            // remove this client from the game
            game.removePlayer(socket);
            console.log('server reports disconnect', { nclients: game.nPlayers })
            console.log('server.ts: clientNames', game.playerNames)
        })


    })
}

// when the game is over, announce the winner and start a new game
// tell the first player it is their turn
// whose resposibility is it to set up the first player and communicate it to the server?
function handleGameOver(player: Player, move: number) {
    if (game.isGameOver) {
        console.log('serverAnnounceWinner', player.name, player.playerID);
        startGame();
    }
}

function requestNextMove(socket: ServerSocket) {
    // wait 1000 ms before sending the next player their turn
    function callback() {
        game.advanceIndex();
        const nextPlayer = game.currentPlayer as Player;  // could maybe cast this to Player
        const nextPlayerSocket = nextPlayer?.socket;
        console.log('server.ts: nextPlayer is', nextPlayer?.name, nextPlayer?.playerID)
        nextPlayerSocket?.emit('yourTurn', gameNumber, game.getPile());
    }
    setTimeout(callback, 1000)

}

function startGame() {
    if (serverGamesRemaining <= 0) {
        console.log('server.ts: No games remaining')
        return;
    }
    serverGamesRemaining--;
    game.resetGame();  // sets the pile to 20 and the current player to 0
    gameNumber++;
    console.log('server.ts: starting new game', gameNumber)
    // get the socket of the current player and tell them it's their turn
    const player0socket = game.currentPlayer?.socket;
    player0socket?.emit('yourTurn', gameNumber, game.getPile());
}

function getPlayerFromSocket(socket: ServerSocket) {
    return game.getPlayers.find(p => p.socket === socket)
}








