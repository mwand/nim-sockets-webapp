
// cli client for the bareBones server. This client does nothing but connect to the server and listen for a message from the server. The point is to see what happens when we exit the client via Ctrl-C.

import io from "socket.io-client";

console.log('bareBonesClient.ts: starting bareBonesClient.ts')
const socket = io("ws://localhost:8080")

socket.on('helloFromServer', (nClients: number) => {
    console.log('bareBonesClient.ts: helloFromServer', nClients)
})

// that's all we do. The point is to see what happens when we exit the client via Ctrl-C.

