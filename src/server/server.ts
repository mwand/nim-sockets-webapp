import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player } from "../shared/types";
import { nanoid } from 'nanoid';
import ServerController from './ServerController'


// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

const httpServer = createHttpServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams });

// `game` is the single source of truth for the game state
const game = new NimGame(20, 3);
// we'll have one controller for each client, but they will *share*
// the same game.
let gameNumber = 0  // this should be in NimGame.

console.log('server.ts: Listening on port 8080')
httpServer.listen(8080);
// setupEventHandlers(io);
io.on("connection", (socket: ServerSocket) => {
    new ServerController(game, io, socket)
})









