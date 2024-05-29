import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../../shared/types';



// we will do all this globally for now
let nclients = 0;
let clientNames: string[] = [];

// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

const httpServer = createHttpServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>
    (httpServer, { cors: corsParams });

const clock = new Clock('server', 1000);
clock.addListener((time) => { io.emit('serverAnnounceTime', time) })
clock.start();

setupEventHandlers(io);
console.log('server.ts: Listening on port 8080')
httpServer.listen(8080);

// dunno why io has to be 'any'
function setupEventHandlers(io:any) {
    //(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    console.log('server setting up event handlers')


    // here io has an any type.  It should be something like ServerSocket
    // if a client is running
    io.on("connection", (socket:ServerSocket) => {
        nclients++
        console.log('server reports new connection', { nclients: nclients })

        // receive a message from the client and echo it to console.log. 
        socket.on("helloFromClient",
            (clientName: string) =>
                handleHelloFromClient(socket, io, clientName));

        //  client-initiated actions: stop and start the clock

        socket.on("clientStopClock",
            (clientName: string) => {
                console.log('server received clientStopClock', clientName)
                if (clock.isRunning()) {
                    clock.stop();
                    io.emit('serverAnnounceClockStopped', clientName);
                } else {
                    console.log('server received clientStopClock but clock is already stopped')
                }
            }
        )

        socket.on("clientStartClock",
            (clientName: string) => {
                console.log('server received clientStartClock', clientName)
                if (!clock.isRunning()) {
                    clock.start();
                    io.emit('serverAnnounceClockStarted', clientName);
                } else {
                    console.log('server received clientStartClock but clock is already running')
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
// why do io and socket have the same type?
function handleHelloFromClient(socket:ServerSocket, io:ServerSocket, clientName: string) {
    console.log(`server received hello from client`, clientName)
    // clientNames.push(clientName);
    // console.log('server reports clientNames', clientNames)
    // // send a message to the client
    // io.emit('serverReplyToConnection');
    // // tell all the clients about the new client
    // io.emit('serverAnnounceNewClient', clientName);
    // // tell all the clients about the new list of clients
    // io.emit('serverAnnounceClients', clientNames);
}








