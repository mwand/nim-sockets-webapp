import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import PlayerList from "./PlayerList";
import NimGame from "./NimGame";
import { Player } from "../shared/types";
import {nanoid} from 'nanoid';




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

let movesLeft = 100;

console.log('server setting up event handlers')
setupEventHandlers(io);
console.log('server.ts: Listening on port 8080')
console.log('server.ts: clientNames', game.playerNames)
httpServer.listen(8080);

// dunno why io has to be 'any'
function setupEventHandlers(io:any) {
    //(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    console.log('server.ts: Setting up event handlers')
    // here io has an any type.  It should be something like ServerSocket
    // if a client is running
    io.on("connection", (socket:ServerSocket) => {
        const nclients = game.nPlayers
        // console.log('server reports new connection', { 
        //     existing_clients: game.playerNames
        // })

        // receive a message from the client 
        socket.on("helloFromClient",
            (clientName: string) =>
            {
                console.log('\nserver received helloFromClient', clientName)
                const playerID = nanoid(6);
                game.addPlayer({ name: clientName, playerID: playerID, socket: socket});
                console.log(`server.ts: ${clientName} assigned ID ${playerID}`)
                socket.emit('assignID', playerID);
                console.log('server.ts: clientNames', game.playerNames)
                io.emit('serverAnnounceNewClient', clientName);
                // the game doesn't start until a client requests it
                }            
        )

        socket.on('clientRequestsStartGame', (clientName: string) => {
            console.log('\nserver received clientRequestsStartGame', clientName)
            if (!game.isGameInProgress) {
            game.resetGame();
            gameNumber++;
            console.log('server.ts: starting new game', gameNumber)
            io.emit('newGame', gameNumber);
            socket.emit('yourTurn', gameNumber, game.getPile());
            } else {
                // do nothing
                console.log('server.ts: game in progress')
            }
        })

        // client takes a turn
        socket.on("clientTakesMove",
            (player:Player, move: number) => {
                
                console.log('\nserver received clientMove', player.name, player.playerID)
                console.log('server.ts: movesLeft = ', movesLeft)
                console.log('game.currentPlayer', game.currentPlayer?.name, game.currentPlayer?.playerID)
                try {
                    console.log('entering try block')
                    game.move(player, move);
                    console.log('server.ts: sticks left', game.getPile())
                    // io is of type any here, so this is not type checked
                    // io.emit('serverAnnounceMove', player, move);
                    if (game.isGameOver) {
                    handleGameOver(player, move);
                    }  else {
                        if (movesLeft <= 0) {
                            console.log('server.ts: no more moves allowed')
                            socket.emit('noMoreMoves');
                            socket.disconnect();
                        }
                        movesLeft--
                        const nextPlayer = game.currentPlayer;
                        console.log('server.ts: nextPlayer', nextPlayer?.name, nextPlayer?.playerID)
                        nextPlayer?.socket?.emit('yourTurn', gameNumber, game.getPile());
                    }
                } catch (errMsg) {
                    if (movesLeft <= 0) {
                        console.log('server.ts: no more moves allowed')
                        socket.emit('noMoreMoves');
                        socket.disconnect();
                    }
                    movesLeft--
                    console.log('server.ts: clientTakesMove error', player.name, move)
                    socket.emit('invalidMove', gameNumber, player.playerID, move)
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
        io.emit('serverAnnounceWinner', player.name, player.playerID);
        gameNumber++;
        game.resetGame();
        io.emit('newGame', gameNumber);
    }
}








