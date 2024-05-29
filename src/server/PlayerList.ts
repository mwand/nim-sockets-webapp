import type { IPlayer, IPlayerList } from "../shared/types";

export default class PlayerList implements IPlayerList {
    /** the players in the game, initially empty */
    private _players: IPlayer[];
    private _currentIndex: number | undefined;


    constructor() {
        this._players = [];
    }

    /** add a player to the list */
    /** make the first player added the initial current player */
    public addPlayer(player: IPlayer) {
        this._players.push(player);
        if (this._players.length === 1) {
            this._currentIndex = 0;
        }
    }

    public get nPlayers() { return this._players.length; }
    public get playerList() { return this._players; }
    

    // index of the current player
    public get currentIndex(): number | undefined { 
        return this._currentIndex; 
    }

    // the current player
    public get currentPlayer(): IPlayer | undefined {
        return this._currentIndex !== undefined? this._players[this._currentIndex] : undefined;
    }
    

    /** advances the current player to the next player in the list */
    public nextPlayer(): void {
        if (this._currentIndex !== undefined) {
            this._currentIndex = (this._currentIndex + 1) % this.nPlayers;
        }
    
    }

}

