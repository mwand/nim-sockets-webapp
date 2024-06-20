import NimGame from "./NimGame";
import { Player, Move, GameState, INimController, ControllerEvents } from "./Types";
import { EventEmitter } from "events"
import TypedEmitter from "typed-emitter"
import { delay } from "./delay";

// manages the Nim game from the players' perspective

export default class NimController
    extends (EventEmitter as new () => TypedEmitter<ControllerEvents>)
    implements INimController {

    /** the initial number of sticks in the pile */
    private initPile: number

    /** the maximum number of sticks a player can take on a turn */
    private maxSticksPerTurn: number

    constructor(_initPile: number, _maxSticksPerTurn: number) {
        super()
        this.initPile = _initPile;
        this.maxSticksPerTurn = _maxSticksPerTurn;
        //console.log(`Controller says: initPile = ${this.initPile}; turnLimit = ${this.turnLimit}`)
        // don't start the controller until all the players have been created.
        // this.start();
    }

    /** the current board */
    private nim: NimGame;
    private get gameState() { return this.nim.pile(); }

    private gameNumber = 0;
    private maxGameNumber = 1000;
    private gameInProgress = false;

    /** the players in the game, initially empty */
    private players: Player[] = [];
    private get nPlayers() { return this.players.length; }

    // the current player
    private currentPlayer: Player

    /** returns the next player, or player[0] is the current player is last in the list */
    private get nextPlayer(): Player {
        const currentIndex = this.players.indexOf(this.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.nPlayers;
        return this.players[nextIndex];
    }


    /** a global ID for each turn */
    private turnID = 0;


    public start() {
        console.log(`Controller says: running start()`)
        this.newGame();
    }

   

    /** try to start a new game.  If too many games, then shut down */
    private newGame() {
        this.gameNumber++;
        console.log(`\nController says: newGame called with gameNumber = ${this.gameNumber}`)

        if (this.gameNumber >= this.maxGameNumber) {
            this.shutdown();
        } else {
            this.players = [];
            this.nim = new NimGame(this.initPile, this.maxSticksPerTurn);
            this.startGame();
        }
    }

    private startGame() {
        console.log(`Controller says: Game number ${this.gameNumber} started`)
        this.emit("newGame", this.gameNumber)
        // the next few method calls will be to joinGame.  
    }

    // this is an async because it needs to pause before completion
    public async joinGame(player: Player, gameNumber: number) {

        if (this._shutdown) {
            console.log(`Controller says: joinGame from ${player} ignored because the server has shut down`)
            return
        }

        // if the game number is too high, don't accept any more players
        if (this.gameNumber >= this.maxGameNumber) {
            return
        }

        console.log(`Controller says: ${player} is trying to join game ${gameNumber}`);

        // if the player is already in the game, don't add them again
        if (this.players.includes(player)) {
            console.log(`Controller says: ${player} is already in the game, not adding them again.`)
            return
        }
        
        // if the game number is wrong, don't add the player
        if (gameNumber !== this.gameNumber) {
            console.log(`Controller says: ${player} is trying to join the wrong game`)
            return
        }

        // add the player to the game
        this.players.push(player)      

        this.emit("playerJoined", this.gameNumber, player, this.gameState)
        console.log(`Controller says: ${player} has joined the game, nPlayers = ${this.nPlayers}`)

       // pause this promise to give other players a chance to join
       await delay(0)


        // this is a control race, not a data race.  If multiple promises get here,
        // the later ones will not change this.players[0]
        // then make the first one in the current player.    
        if (this.nPlayers >= 1) {
            this.currentPlayer = this.players[0];
        }
        
        // if there are at least two players in the game, and a game is not already in progress,
        // issue a readyToMove event for the first player.  This starts the game
        if ((this.nPlayers >= 2) && (!this.gameInProgress) && (!this._shutdown)) {
            // execute this only the first time nPlayers >= 2.
            this.gameInProgress = true;
            console.log(`\nController says: issuing readyToMove event for first player: ${this.currentPlayer}`)
            this.emit("readyForMove", this.currentPlayer, this.turnID, this.gameState);
        }    
       
    }



    // throws an error if it's not the player's turn or if the number of sticks to take is invalid
    public move(player: Player, turnID: number, numSticks: number) {

        if (this._shutdown) {
            console.log(`Controller says: move from ${player} ignored because the server has shut down`)
            return
        }

        // if the move violates the invariant, then ignore
        if (player !== this.currentPlayer) {
            console.log(`Controller says: move ignored because it's not ${player}'s turn`)
            return
        }

        // if the turnID is wrong, then ignore
        if (turnID !== this.turnID) {
            console.log(`Controller says: move ignored because the turnID is wrong`)
            return
        }

        // tell the nim object to take the sticks.
        // if the move is invalid, an error will be thrown by the nim object.
        this.nim.move(numSticks)
        // this.emit("playerMoved", player, this.turnID, numSticks, this.gameState);
        console.log(`Controller says: ${player} took ${numSticks} sticks; gameState = ${this.gameState}`)
        if (this.nim.isGameOver()) {
            this.emit("playerWon", player);
            console.log(`Controller says: ${player} won the game!`)
            this.gameInProgress = false;
            this.newGame();  // game over, so start a new game
        }
        else { this.nextTurn(); }

    }

    /** advances the turn counter and announces the next player*/
    private nextTurn() {

        // advance the turn counter
        this.turnID++;

        // advance the current player
        this.currentPlayer = this.nextPlayer;   // woo hoo! one-liner!

        // announce the next player
        console.log(`\nController says: issuing readyToMove event for ${this.currentPlayer}; turnID = ${this.turnID}`)
        this.emit("readyForMove", this.currentPlayer, this.turnID, this.gameState);
        return
    }


    private _shutdown = false;

    public shutdown(): void {
        console.log(`Controller says: shutdown called`)
        this.emit("serverShutdown");
        this._shutdown = true;
    }

}