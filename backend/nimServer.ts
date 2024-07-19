import { createServer as createHttpServer } from "http";
import CORS from 'cors';

import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player } from "../shared/types";
import { nanoid } from 'nanoid';
import Express from 'express';
import ServerController from './nimController'


// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "*",
    methods: ["GET", "POST"]
}

const app = Express();
app.use(CORS());
const httpServer = createHttpServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams, 
        'pingInterval': 1000, 'pingTimeout': 2000 
    });
const port = process.env.PORT || 8080

// `game` is the single source of truth for the game state
const game = new NimGame(20, 3);

// we'll have one controller for each client, but they will *share*
// the same game.

let nClients = 0;


app.get('/', (req, res) => {
    res.send('nimServer.ts: Hello from Nim Server');
});

// set up a new controller for each client
io.on("connection", (socket: ServerSocket) => {
    console.log('nimServer.ts received new connection.')
    
    nClients++;
    console.log('nimServer.ts: nClients:', nClients)
    const controller = new ServerController(game, io, socket)

    socket.on('disconnect', () => {
        console.log('nimServer.ts: a client disconnected')
        controller.disconnect()
        nClients--;
        console.log('nimServer.ts: nClients:', nClients)
        
    })
})

httpServer.listen(port, () =>{
    console.log('nimServer.ts: Listening on port', port, { nClients: nClients})
});
httpServer.on('error', (err) => {
    console.error('nimServer.ts: Error starting server:', err)
});







