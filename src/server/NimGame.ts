import { Player, ServerSocket} from '../shared/types';
type PlayerList = Player[]

/**
 * Represents a game of Nim.
 * initialized to beginning of game
 */
export default class NimGame {
    
    private _gameNumber = 0  
    // incremented by this.resetGame

    public get gameNumber(): number {return this._gameNumber}
    

    /** the number of sticks a player can take on their turn */
    private _turnLimit: number;

    /** size of the initial pile */
    private _initPile: number;

      /** size of the current pile */
      private _pile: number;
    
    private _gameInProgress: boolean = false;
    private _gameOver: boolean = false;

    /** the players in the game */
    private _players: Player[] = [];

    /** the index of the current player in the players array */
    private _currentIndex : number | undefined = undefined
    
    /**
     * Creates a new instance of the Nim class.
     * @param initPile The initial number of sticks in the pile.
     */
    constructor(initPile: number, turnLimit: number) {
        this._initPile = initPile;
        this._pile = initPile;
        this._turnLimit = turnLimit;
    }

    /** get the players */
    public get players(): PlayerList {
        return this._players;
    }

    public get playerNames(): string[] { return this._players.map(p => p.name); }

    /** add a player */
    public addPlayer(player: Player): void {
        this._players.push(player);        
    }

    public get currentPlayer(): Player | undefined {
        if (this._currentIndex === undefined) {
            return undefined
        }   
        return this._players[this._currentIndex]
    }

    // use socket as the key to remove a player
    public removePlayer(socket:ServerSocket) {
        this._players = this._players.filter(p => p.socket !== socket)
    }

    // does nothing if there are no players
    public advanceIndex(): void {
        if (this._currentIndex !== undefined) {
            this._currentIndex = (this._currentIndex + 1) % this.nPlayers;
        }
    }

    public get nPlayers() { return this._players.length; }

    


    /** resets the game to the starting state, with the same set of players */
    /** player[0] always goes first */
    public resetGame(): void {
        this._pile = this._initPile;
        this._gameOver = false;
        this._gameInProgress = true;
        this._gameNumber++
        if (this._players.length > 0) {
            this._currentIndex = 0;
        } else throw new Error('No players in the game')
    }

    /**
     * Gets the current number of sticks in the pile.
     * @returns The current number of sticks in the pile.
     */
    public pile(): number {
        return this._pile;
    }

    /**
     * Determines if the game is over.
     * @returns True if the game is over (i.e. the pile is empty), false otherwise.
     */
    public get isGameOver(): boolean {
        return this._pile === 0;
    }   
    
    public get isGameInProgress(): boolean {
        return this._gameInProgress;
    }

    /**
     * Takes a specified number of sticks from the pile.
     * @param numSticks The number of sticks to take from the pile.
     * @throws An error if the number of sticks to take is invalid (i.e. less than 1 or greater than the number of sticks in the pile).
     * if the number of sticks is valid, advances the turn to the next player
    */
    public move(player: Player, numSticks: number): void {
        if (!this._gameInProgress) {
            console.log('game not in progress')
            throw new Error("Game not in progress");
        }
        if (this._gameOver) {
            console.log('game over')
            throw new Error("Game is over");
        }
        if (player.playerID !== this.currentPlayer?.playerID) {
            console.log('not this player\'s turn')
            console.log('player', player.name, player.playerID);
            console.log('currentPlayer', this.currentPlayer?.name, this.currentPlayer?.playerID)
            
            throw new Error("Not this player's turn");
        }
        if (numSticks < 1 || numSticks > this._turnLimit) {
            console.log('invalid number of sticks')
            throw new Error(`Invalid number of sticks: ${numSticks}`);
        }
        // take the sticks and advance to the next player
        this._pile -= numSticks;
        // this.advanceIndex()
        // console.log('advanceIndex: new index is', this._currentIndex);
    }
}
