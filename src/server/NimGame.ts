import { Player, ServerSocket, INimGame, moveResponse } from '../shared/types';
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

    public get boardState(): number { return this._pile }

    public get isGameOver(): boolean { return this._pile === 0 }

    private _gameInProgress: boolean = false;
    private _gameOver: boolean = false;



    /** the players in the game, initally empty */
    private _players = new PlayerList();

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

    // /** get the players */
    // public get players(): PlayerList {
    //     return this._players;
    // }

    // public get playerNames(): string[] { return this._players.map(p => p.name); }

    /** add a player */
    // if there are two players, start the game
    public addPlayer(player: Player): void {
        this._players.addPlayer(player);
        if (this._players.nPlayers() === 2) {
            console.log('NimGame.ts: starting game')
            // start the game with first player to join as the first player
            this.startGame(this._players.currentPlayer as Player);
        }
    }

    // use socket as the key to remove a player
    public removePlayer(socket: ServerSocket) {
        this._players.removePlayer(socket)
    }


    public get nPlayers() { return this._players.nPlayers; }

    /** resets the game to the starting state, with the same set of players */
    // start the game by sending the first player their turn. Also tells 
    // each player that the game has started.
    public startGame(player:Player): void {
        this._gameNumber++
        this._pile = this._initPile;
        this._gameInProgress = true; 
        // tell each player that the game has started       
        this._players.players.forEach(p => {
            p.socket.emit('newGame', this._gameNumber);
        })
        // tell the first player that it's their turn
        player.socket.emit('yourTurn', this._gameNumber, this._pile);
    }

    /**
     * Gets the current number of sticks in the pile.
     * @returns The current number of sticks in the pile.
     */
    public pile(): number {
        return this._pile;
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
    public move(player: Player, numSticks: number): moveResponse {
        if (!this._gameInProgress) {
            console.log('game not in progress')
            throw new Error("No game in progress");
        }
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
            // the game is over, reset the pile
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



