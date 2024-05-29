import PlayerList from './PlayerList';
import { Player } from '../shared/types';
/**
 * Represents a game of Nim.
 * initialized to beginning of game
 */
export default class NimGame {  

    /** the number of sticks a player can take on their turn */
    private _turnLimit: number;

    /** size of the initial pile */
    private _initPile: number;

      /** size of the current pile */
      private _pile: number;
    
    private _gameInProgress: boolean = false;
    private _gameOver: boolean = false;

    // the PlayerList maintains the list of players and the current player
    // it has state, so it is not a simple list of players
    private _players: PlayerList
    
    /**
     * Creates a new instance of the Nim class.
     * @param initPile The initial number of sticks in the pile.
     */
    constructor(initPile: number, turnLimit: number, players: PlayerList) {
        this._initPile = initPile;
        this._pile = initPile;
        this._turnLimit = turnLimit;
        this._players = players        
    }

    /** starts a new game, with the same set of players */
    public newGame(): void {
        this._pile = this._initPile;
        this._gameOver = false;
        this._gameInProgress = false;
    }

    /** add a player */
    public addPlayer(player: Player): void {
        this._players.addPlayer(player);
        // if this is the first player added, make them the first player to play
        // .addPlayer() sets the first player to be the current player
        // if there are two players, start the game
        if (this._players.nPlayers >= 2) {       
            this._gameInProgress = true;
        }
    }

    /** get the players */
    public getPlayers(): PlayerList {
        return this._players;
    }

    public getCurrentPlayer(): Player | undefined {   
        return this._players.currentPlayer;
    }
    /**
     * Gets the current number of sticks in the pile.
     * @returns The current number of sticks in the pile.
     */
    public getPile(): number {
        return this._pile;
    }

    /**
     * Determines if the game is over.
     * @returns True if the game is over (i.e. the pile is empty), false otherwise.
     */
    public isGameOver(): boolean {
        return this._pile === 0;
    }   
    
    /**
     * Takes a specified number of sticks from the pile.
     * @param numSticks The number of sticks to take from the pile.
     * @throws An error if the number of sticks to take is invalid (i.e. less than 1 or greater than the number of sticks in the pile).
     * if the number of sticks is valid, advances the turn to the next player
    */
    public move(player: Player, numSticks: number): void {
        if (!this._gameInProgress) {
            throw new Error("Game not in progress");
        }
        if (this._gameOver) {
            throw new Error("Game is over");
        }
        if (player !== this._players.currentPlayer) {
            throw new Error("Not this player's turn");
        }
        if (numSticks < 1 || numSticks > this._turnLimit) {
            throw new Error(`Invalid number of sticks: ${numSticks}`);
        }
        // take the sticks and advance to the next player
        this._pile -= numSticks;
        this._players.nextPlayer();
    }
}
