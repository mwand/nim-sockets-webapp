import type { Player, ServerSocket, IPlayerList } from "../shared/types";

export default class PlayerList implements IPlayerList {

    /** the players in the game, initially empty */
    private _players: Player[] = []

    public get players () {return this._players;}
    public get playerNames() { return this._players.map(p => p.name) }

    public nPlayers() {return this._players.length; }

    /** the index of the current player */
    private _currentIndex: number | undefined;


    // constructor() {
    //     this._players = [];
    // }

    /** add a player to the list */
    /** make the first player added the initial current player */
    public addPlayer(player: Player) {
        this._players.push(player);
        if (this._players.length === 1) {
            this._currentIndex = 0;
        }
    }

    // use socket as the key to remove a player
    public removePlayer(socket:ServerSocket) {
        this._players = this._players.filter(p => p.socket !== socket)
    }

    // public get nPlayers() { return this._players.length; }
    // public get playerList() { return this._players; }
    

    // index of the current player
    public get currentIndex(): number | undefined { 
        return this._currentIndex; 
    }

    // the current player
    public get currentPlayer(): Player | undefined {
        return this._currentIndex !== undefined? this._players[this._currentIndex] : undefined;
    }
    

    /** advances the current player to the next player in the list */
    public advancePlayer(): void {
        if (this._currentIndex !== undefined) {
            const nPlayers = this._players.length
            this._currentIndex = (this._currentIndex + 1) % nPlayers
        }
    }

}

