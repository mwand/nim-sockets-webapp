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

    // the client's view of the socket to the server
    private socket: ClientSocket = io("ws://localhost:8080")

    private _player: ClientPlayer = {name: "", playerID: "" }

    // take at most this many moves and then stop
    private movesLeft: number = 10000


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
        // no, server starts game automatically 
        // this.socket.emit('clientRequestsStartGame', this.clientName, this._player.playerID);
    }

    private setupEventHandlers() {        
        this.socket.on('yourTurn', this.handleYourTurn);
        // this.socket.on('invalidMove', this.handleInvalidMove);
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
        console.log(`${this.clientName} received yourTurn; gameNumber=${gameNumber}, boardState=${boardState}`)
        const move = this.strategy(boardState);
        console.log(`${this.clientName} sending clientTakesMove`, move, '\n')
        this.socket.emit('clientTakesMove', move);
    }

    // not used
    // private handleInvalidMove = (gameNumber: GameNumber, playerID: PlayerID, move: Move) => {
    //     console.log(`${this.clientName} received invalidMove`, gameNumber, move)
    //     // 1 is always a legal move
    //     const nextMove = 1
    //     console.log(`${this.clientName} sending clientTakesMove`, nextMove)
    //     this.socket.emit('clientTakesMove', this._player, nextMove);
    // }

    

    // not used
    private handleGameStateChanged = (gameState: GameState) => {
        console.log(`${this.clientName} received gameStateChanged`, gameState)
    }

}

