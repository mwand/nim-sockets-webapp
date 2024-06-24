import PlayerList from "./PlayerList";
import { Player } from "../shared/types";

describe("PlayerList", () => {
    let playerList: PlayerList;
    let player1: Player;
    let player2: Player;
    let player3: Player;

    beforeEach(() => {
        playerList = new PlayerList();
        player1 = { name: "Alice" };
        player2 = { name: "Bob" };
        player3 = { name: "Charlie" };
    });

    it("should add a player to the list", () => {
        playerList.addPlayer(player1);
        expect(playerList.nPlayers).toBe(1);
        expect(playerList.playerList).toContain(player1);
    });

    it("should make the first player added the initial current player", () => {
        playerList.addPlayer(player1);
        expect(playerList.currentIndex).toBe(0);
        expect(playerList.currentPlayer).toBe(player1);
    });

    it("should advance the current player to the next player in the list", () => {
        playerList.addPlayer(player1);
        playerList.addPlayer(player2);
        playerList.addPlayer(player3);

        playerList.advancePlayer();
        expect(playerList.currentIndex).toBe(1);
        expect(playerList.currentPlayer).toBe(player2);

        playerList.advancePlayer();
        expect(playerList.currentIndex).toBe(2);
        expect(playerList.currentPlayer).toBe(player3);

        // After reaching the end of the list, it should wrap around to the first player
        playerList.advancePlayer();
        expect(playerList.currentIndex).toBe(0);
        expect(playerList.currentPlayer).toBe(player1);
    });
});