import type { Player, ServerSocket, IPlayerList } from "../shared/types";

export default class PlayerList implements IPlayerList {

    /** this version allows only two players
     * the first player to join is player 0
     * the second player to join is player 1
     * if a third player tries to join, an error is thrown
     * (it's up to the controller to prevent this from happening)
     * if a player leaves, the remaining becomes player 0 again.
     * 
     * the current player is the one in slot this._currentIndex
     */

    /** the players in the game, initially empty */
    private _players: Player[] = []

    public get players () {return this._players;}
    public get playerNames() { return this._players.map(p => p.name) }

    public nPlayers() {return this._players.length; }

    /** the index of the current player */
    private _currentIndex: number | undefined;    

    /** add a player to the list */
    /** make the first player added the initial current player */
    public addPlayer(player: Player) {
        this._players.push(player);
        if (this._players.length === 1) {
            this._currentIndex = 0;
        }
    }

    // use socket as the key to remove a player.
    // the remaining player, is left in slot 0 (!)
    // if there are more than two players, you'll need something more elaborate.
    public removePlayer(socket:ServerSocket) {
        this._players = this._players.filter(p => p.socket !== socket)
        // at this point, the game stops.  How to signal this?
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

