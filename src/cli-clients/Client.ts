import { PlayerID, BoardState, GameNumber, Player, Move, Strategy } from "../../shared/types";
import { ClientSocket } from "../../shared/types";
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
    }

    private setupEventHandlers() {        
        this.socket.on('yourTurn', this.handleYourTurn.bind(this));
        this.socket.on('assignID', this.handleAssignID.bind(this));
        this.socket.on('newGame', this.handleNewGame.bind(this));
        this.socket.on('serverAnnounceNewClient', this.handleServerAnnounceNewClient.bind(this));
        // type of serverAnnouncePlayerMoved has changed since the last commit.
        // need to update this to match latest version of types.ts
        // this.socket.on('serverAnnouncePlayerMoved', this.handleServerAnnouncePlayerMoved.bind(this));
        this.socket.on('serverAnnounceWinner', this.handleServerAnnounceWinner.bind(this));
    
    }

    private handleAssignID = (playerID: PlayerID) => {
        console.log(`${this.clientName} received ID ${playerID} from server`)
        this._player = { name: this.clientName, playerID: playerID }
    }

    // don't take more than movesLeft moves
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

    // in cli-client, messages below here are just echoed to the console.
    // this will be different for a web clent

    private handleNewGame = (gameNumber: GameNumber) => {
        console.log(`${this.clientName} received newGame`, gameNumber)
    }
    

    // not used
    private handleServerAnnounceNewClient = (playerName: string, playerID: PlayerID) => {
        console.log(`${this.clientName} received serverAnnounceNewClient`, playerName, playerID)
    }

    private handleServerAnnouncePlayerMoved = (playerName: string, move: Move, resultingBoardState: BoardState, nextPlayerName: string) => {
        console.log(`${this.clientName} received serverAnnouncePlayerMoved`, playerName, move, resultingBoardState, nextPlayerName)
    }

    private handleServerAnnounceWinner = (playerName: string, playerID: PlayerID) => {
        console.log(`${this.clientName} received serverAnnounceWinner`, playerName, playerID)
    }

}

