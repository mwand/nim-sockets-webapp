import { Socket as _ServerSocket } from "socket.io";
import { Socket as _ClientSocket } from "socket.io-client";


/** Protocol:
 * on connect, server sends client serverReplyToConnection.
 * client checks to see if it is the same as the name it sent.
 */

/** Sequence Diagrams
 * onConnection:
 * Client-->Server: helloFromClient
 * Server-->Client: serverReplyToConnection
 * Server-->AllClients: serverAnnounceNewClient
 * Server-->AllClients: serverAnnounceClients
 * 
 * on clock tick:
 * Server->AllClients: serverAnnounceTime
 * 
 * Client initiates stop clock:
 * Client->Server: clientStopClock
 * if clock is already stopped, server does nothing, else:
 * Server->AllClients: serverAnnounceClockStopped
 * 
 * Client initiate start clock:
 * Client->Server: clientStartClock
 * if clock is already started, server does nothing, else:
 * Server->AllClients: serverAnnounceClockStarted
 *  
 */

/** old... 
export interface ServerToClientEvents {


    // controller announces that a player has joined the game
    playerJoined: (playerName: string) => void;

    // controller announces that it is starting a new game
    newGame: (gameNumber:GameNumber) => void;

    // controller announces that a player has moved.
    playerMoved: (gameNumber:GameNumber, player: IPlayer, move: Move, newState: BoardState) => void;

    // controller announces the player's move and the new state of the game.
    gameStateChanged: (gameState:GameState) => void;

    // controller announces the winner of the game
    playerWon: (gameNumber:GameNumber, player: IPlayer) => void;  
}



export interface ClientToServerEvents {

    // client requests to join server
    helloFromClient: (clientName:string) => void;

    // client requests the clock to pause for a while
    clientStopClock: (clientName:string) => void;

    // client requests the clock to start
    clientStartClock: (clientName:string) => void;

}


export type ServerSocket = _ServerSocket<ClientToServerEvents, ServerToClientEvents>;
export type ClientSocket = _ClientSocket<ServerToClientEvents, ClientToServerEvents>;

// why this wrapper?
export type SocketClientState = {
    socket: ClientSocket
}

*/
