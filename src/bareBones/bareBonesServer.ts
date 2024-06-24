import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";

// only listen to requests from localhost:3000.  Not sure if this is necessary
const corsParams = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}

const httpServer = createHttpServer();
const io = new Server
    (httpServer, { cors: corsParams,
        'pingInterval': 1000, 'pingTimeout': 2000

     });

console.log('bareBonesServer.ts: Listening on port 8080')
httpServer.listen(8080);
let nClients = 0;

io.on("connection", (socket: any) => {
    console.log('bareBonesServer.ts received new connection.')
    nClients++;
    console.log('bareBonesServer.ts: nClients:', nClients)
    socket.emit('helloFromServer', nClients)
    socket.on('disconnect', () => {
        console.log('bareBonesServer.ts: client disconnected')
        nClients--;
        console.log('bareBonesServer.ts: nClients:', nClients)
    })
})








