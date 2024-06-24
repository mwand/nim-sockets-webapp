import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player } from "../shared/types";
import { nanoid } from 'nanoid';
import ServerController from './nimController'


// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

const httpServer = createHttpServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams, 
        'pingInterval': 1000, 'pingTimeout': 2000 
    });

// `game` is the single source of truth for the game state
// const game = new NimGame(20, 3);

// we'll have one controller for each client, but they will *share*
// the same game.

console.log('server.ts: Listening on port 8080')
httpServer.listen(8080);
let nClients = 0;
// set up a new controller for each client
io.on("connection", (socket: ServerSocket) => {
    console.log('nimServer.ts received new connection.')
    nClients++;
    console.log('nimServer.ts: nClients:', nClients)
    // socket.emit('helloFromServer', nClients)
    socket.on('disconnect', () => {
        console.log('nimServer.ts: client disconnected')
        nClients--;
        console.log('nimServer.ts: nClients:', nClients)
        // new ServerController(game, io, socket)
    })
})









