import type { Player, IPlayerList, ServerSocket } from "../shared/types";

// mock socket definition for testing
// export type ServerSocket = any;

export default class PlayerList implements IPlayerList {

    /** the players in the game, initially empty */
    private _players: Player[] = []

    public get players () {return this._players;}
    public get playerNames() { return this._players.map(p => p.name) }

    public nPlayers() {return this._players.length; }

   
    // the ID of the current player is the key to the player object in the list
    private _currentID: string | undefined;

    // the current player is the one with the currentID.
    public get currentPlayer(): Player | undefined {
        return this._currentID !== undefined? 
            this._players.find(p => p.playerID === this._currentID) : undefined;
    }
    

    /** add a player to the list */
    /** make the first player added the initial current player */
    public addPlayer(player: Player) {
        this._players.push(player);
        if (this._players.length === 1) {
            this._currentID = player.playerID;
        }
    }

    // use socket as the key to remove a player
    
    public removePlayer(socket:ServerSocket) {
        const index = this._players.findIndex(p => p.socket === socket)
        // if the player removed is the current player, advance to the next player
        // removing the last player makes the current player undefined.
        if (this._players[index] === this.currentPlayer) {  
            this.advancePlayer();
        }
        this._players = this._players.filter(p => p.socket !== socket)
    }

    private get _indexOfCurrentPlayer(): number | undefined {
        return this.currentPlayer !== undefined 
            ? this._players.findIndex(p => p === this.currentPlayer) 
            : undefined;
    }

    /** advances the current player to the next player in the list */
    // if there are no players, the next current player is undefined
    public advancePlayer(): void {
        if (this._currentID !== undefined) {
            const nPlayers = this._players.length
            const nextIndex = (this._indexOfCurrentPlayer as number + 1) % nPlayers
            this._currentID = this._players[nextIndex].playerID
        } else {
            this._currentID = undefined;  // this line included for clarity
        }
    }

}

