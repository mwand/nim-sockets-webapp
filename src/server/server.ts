import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import PlayerList from "./PlayerList";
import NimGame from "./NimGame";
import { Player } from "../shared/types";



// we will do all this globally for now
let nclients = 0;
let clientNames: string[] = [];

// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

// get this working first, then refactor into a controller...

const httpServer = createHttpServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams });
const clients = new PlayerList();
// clients is shared with the game.  Probably not the best design.
const game = new NimGame(20, 3, clients);
let gameNumber = 0;

console.log('server setting up event handlers')
setupEventHandlers(io);
console.log('server.ts: Listening on port 8080')
httpServer.listen(8080);

// dunno why io has to be 'any'
function setupEventHandlers(io:any) {
    //(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    console.log('server.ts: Setting up event handlers')
    // here io has an any type.  It should be something like ServerSocket
    // if a client is running
    io.on("connection", (socket:ServerSocket) => {
        nclients++
        console.log('server reports new connection', { nclients: nclients })

        // receive a message from the client 
        socket.on("helloFromClient",
            (clientName: string) =>
            {
                console.log('server received helloFromClient', clientName)
                clientNames.push(clientName);
                console.log('server.ts: clientNames', clientNames)
                // we'll need the socket for reply messages
                console.log('server.ts: adding client', { name: clientName})
                clients.addPlayer({ name: clientName, socket: socket});
                game.addPlayer({ name: clientName, socket: socket});
                console.log('server.ts: clients.nPlayers', clients.nPlayers)
                io.emit('serverAnnounceNewClient', clientName);
                // start the game as soon as the first player joins.
                if (clients.nPlayers === 1) {
                    game.newGame();
                    gameNumber++;
                    console.log('server.ts: new game', gameNumber)
                    io.emit('newGame', gameNumber);
                    socket.emit('yourTurn', gameNumber, game.getPile());
                }
            }
        )

        // client takes a turn
        socket.on("clientTakesMove",
            (player:Player, move: number) => {
                console.log('server received clientMove', player, move)
                try {
                    game.move(player, move);
                    // io is of type any here, so this is not type checked
                    // io.emit('serverAnnounceMove', player, move);
                    if (game.isGameOver()) {
                    handleGameOver(player, move);
                    }  else {
                        const nextPlayer = game.getCurrentPlayer();
                        nextPlayer?.socket?.emit('yourTurn', gameNumber, game.getPile());
                    }
                } catch (errMsg) {
                    console.log('server.ts: clientTakesMove error', errMsg)
                    socket.emit('invalidMove', gameNumber, player, move)
                }                
            }
        ) 
    }) 
    
    // I don't know how this works
    io.on("disconnect", (socket:ServerSocket) => {
        nclients--
        console.log('server reports disconnect', { nclients: nclients })
    })
}

function handleGameOver(player: Player, move: number) {
    if (game.isGameOver()) {
        io.emit('serverAnnounceWinner', player);
        gameNumber++;
        game.newGame();
        io.emit('newGame', gameNumber);
    }
}








