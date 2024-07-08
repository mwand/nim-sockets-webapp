import next from 'next';
import { Player, ServerSocket, INimGame, moveResponse, GameStatus } from '../shared/types';
import PlayerList from './PlayerList';

/**
 * Represents a game of Nim.
 * initialized to a game with no players.
 */
export default class NimGame implements INimGame {

    private _gameNumber = 0
    // incremented by this.resetGame

    public get gameNumber(): number { return this._gameNumber }


    /** the number of sticks a player can take on their turn */
    private _turnLimit: number;

    /** size of the initial pile */
    private _initPile: number;

    /** size of the current pile */
    private _pile: number;

    /** the players in the game, initally empty */
    public _players = new PlayerList();

    /** is a game currently in progress? */
    /* this is bad, because it is not a single source of true 
    the game is in progress if the players list has at least two players   */
    // private _gameInProgress: boolean = false;

     /**
     * Creates a new instance of the Nim class.
     * @param initPile The initial number of sticks in the pile.
     */
    // should the game know its controller? No,
    // there are many controllers, but only one game.
    constructor(initPile: number, turnLimit: number) {
        this._initPile = initPile;
        this._pile = initPile;
        this._turnLimit = turnLimit;
    }


    // getters

    public get boardState(): number { return this._pile }
    public get isGameOver(): boolean { return this._pile === 0 }
    public get playerNames(): string[] { return this._players.playerNames }
    // I had forgotten to put the : number return type on this function.
    // Caused all kinds of mysterious errors.
    public get nPlayers() : number { return this._players.nPlayers(); }  
    public get isGameInProgress(): boolean { return (this.nPlayers >= 2) }
    public get currentPlayer(): Player | undefined { return this._players.currentPlayer; }
    
    public get gameStatus() : GameStatus {
        return {
            gameInProgress: this.isGameInProgress,
            boardState: this._pile,
            nextPlayerName: this._players.currentPlayer?.name,
            nextPlayerID: this._players.currentPlayer?.playerID
        }
    }

    /** add a player */
    // starting the game is the controller's job
    public addPlayer(player: Player): void {
        this._players.addPlayer(player);
        console.log(`game added player ${player.name}`) 
        console.log(`game current players:`, this.playerNames)
        console.log(`game players:`, this._players.playerNames)
        console.log(`game nPlayers:`, this._players.nPlayers())
        console.log(`gameStatus:`, this.gameStatus)       
    } 

    // we'll use the socket as the key to remove a player
    public removePlayer(removedPlayerSocket: ServerSocket) {
       // PlayerList will advance to the next player
        this._players.removePlayer(removedPlayerSocket)
        // if there are no more players, the controller will restart the game
        // // if there are no players, end the game
        // if (this._players.nPlayers() === 0) {
        //     this._pile = this._initPile;
       //  } 
    }    

    /** resets the game to the starting state, with the same set of players (possibly empty) */    
    public startGame(firstPlayer:Player | undefined): void {
        if (firstPlayer !== undefined) {
            console.log(`NimGame.ts[${firstPlayer.name}]: starting game`)
        }
        this._gameNumber++
        this._pile = this._initPile;       
       
    }  

    /**
     * Takes a specified number of sticks from the pile.
     * @param numSticks The number of sticks to take from the pile.
     * @throws An error if the number of sticks to take is invalid (i.e. less than 1 or greater than the number of sticks in the pile).
     * if the number of sticks is valid, advances the turn to the next player
    */
    public move(player: Player, numSticks: number): moveResponse {
        
        if (player.playerID !== this._players.currentPlayer?.playerID) {
            console.log('not this player\'s turn')
            console.log('player', player.name, player.playerID);
            console.log('currentPlayer',
                this._players.currentPlayer?.name,
                this._players.currentPlayer?.playerID)
            throw new Error("Not this player's turn");
        }
        if (numSticks < 1 || numSticks > this._turnLimit) {
            // if the move is invalid, report it and go on to the next player
            this._players.advancePlayer()
            return {
                moveAccepted: false,
                isGameOver: false,
                player: player,
                move: numSticks,
                resultingBoardState: this._pile,
                nextPlayer: this._players.currentPlayer as Player
            }
        }
        // take the sticks and advance to the next player
        this._pile -= numSticks;
        if (this._pile > 0) {
            // the game is not over, so advance to the next player
            this._players.advancePlayer();
            return {
                moveAccepted: true,
                isGameOver: false,
                player: player,
                move: numSticks,
                resultingBoardState: this._pile,
                nextPlayer: this._players.currentPlayer as Player
            }
        } else {
            // the game is over, reset the pile.
            // the winner gets to go first in the next game.
            // should this be the job of startGame?
            this._pile = this._initPile;
            return {
                moveAccepted: true,
                isGameOver: true,
                player: player,
                move: numSticks,
                resultingBoardState: this._pile,
                nextPlayer: this._players.currentPlayer as Player
            }

        }
    }

}



