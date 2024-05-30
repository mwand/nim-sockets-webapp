import { PlayerID, BoardState, GameNumber, GameState, INimController, Player, Move, Strategy } from "../shared/types";
import { ClientSocket } from "../shared/types";
import io from "socket.io-client";
import { nanoid } from "nanoid";

// playerID is assigned by the server
type ClientPlayer = {name: string, playerID: PlayerID}

/** Representation of the player in the client.
 */

/** On construction, joins the game, by sending a helloFromClient
 * message to the server
 * 
 * Afterwards, listens for yourTurn events from the server, and 
 * responds with a Move.
 */

export default class Client {

    private socket: ClientSocket
        = io("ws://localhost:8080")

    private _player: ClientPlayer = {name: "", playerID: ""}

    // take at most 20 moves and then stop
    private movesLeft: number = 5


    constructor(
        private clientName: string,  
        private strategy: Strategy 
        ) {
        console.log(`${clientName} setting up event handlers`)
       
        // console.log(this._player.playerID)
        this.setupEventHandlers()
    }

    public start() {
        console.log(`${this.clientName} sending helloFromClient`)
        // tell the server our friendly name
        this.socket.emit('helloFromClient', this.clientName);
        console.log(`${this.clientName} sent helloFromClient`)
        this.socket.emit('clientRequestsStartGame', this.clientName);
    }

    private setupEventHandlers() {        
        this.socket.on('yourTurn', this.handleYourTurn);
        this.socket.on('invalidMove', this.handleInvalidMove);
        this.socket.on('assignID', this.handleAssignID);
    
    }

    private handleAssignID = (playerID: PlayerID) => {
        console.log(`${this.clientName} received ID ${playerID} from server`)
        this._player = { name: this.clientName, playerID: playerID }
    }

    // take at most 20 moves and then stop
    private handleYourTurn = (gameNumber: GameNumber, boardState: BoardState) => {
        if (this.movesLeft <= 0) {
            console.log(`${this.clientName} is out of moves`)
            return;
        }
        this.movesLeft--;
        console.log(`${this.clientName} received yourTurn`, gameNumber, boardState)
        const move = this.strategy(boardState);
        console.log(`${this.clientName} sending clientTakesMove`, move)
        this.socket.emit('clientTakesMove', this._player, move);
    }

    private handleInvalidMove = (gameNumber: GameNumber, playerID: PlayerID, move: Move) => {
        console.log(`${this.clientName} received invalidMove`, gameNumber, move)
        // 1 is always a legal move
        const nextMove = 1
        console.log(`${this.clientName} sending clientTakesMove`, nextMove)
        this.socket.emit('clientTakesMove', this._player, nextMove);
    }

    

    // not used
    private handleGameStateChanged = (gameState: GameState) => {
        console.log(`${this.clientName} received gameStateChanged`, gameState)
    }

}

