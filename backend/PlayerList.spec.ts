import PlayerList from "./PlayerList";
import { Player, ServerSocket } from "../shared/types";


// export type Player = {
//     name: string;
//     playerID: string; // unique id for this player
//     socket: any // the server end of the  socket for this client
// }

describe("PlayerList", () => {
    let playerList: PlayerList;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;
    const socket1 = 'socket1' as unknown as ServerSocket;
    const socket2 = 'socket2' as unknown as ServerSocket;
    const socket3 = 'socket3' as unknown as ServerSocket;
    const socket4 = 'socket4' as unknown as ServerSocket;

    beforeEach(() => {
        playerList = new PlayerList();
        player1 = { name: "Alice", playerID: "1", socket: socket1 };
        player2 = { name: "Bob", playerID: "2", socket: socket2 };
        player3 = { name: "Charlie", playerID: "3", socket: socket3};
        player4 = { name: "David", playerID: "4", socket: socket4 };
    });

    it("should add a player to the list", () => {
        playerList.addPlayer(player1);
        expect(playerList.players).toContain(player1);
    });

    it("should remove a player from the list", () => {
        playerList.addPlayer(player1);
        playerList.addPlayer(player2);
        playerList.removePlayer(socket1);
        expect(playerList.players).not.toContain(player1);
    });

    it("should remove a player from the middle of list", () => {
        playerList.addPlayer(player1);
        playerList.addPlayer(player2);
        playerList.addPlayer(player3);
        playerList.removePlayer(socket2);
        expect(playerList.players).not.toContain(player2);
    })



    it("should set the first added player as the current player", () => {
        playerList.addPlayer(player1);
        expect(playerList.currentPlayer).toBe(player1);
    });

    it("should advance the current player to the next player in the list", () => {
        playerList.addPlayer(player1);
        playerList.addPlayer(player2);
        playerList.addPlayer(player3);
        expect(playerList.currentPlayer).toBe(player1);
        playerList.advancePlayer();
        expect(playerList.currentPlayer).toBe(player2);
        playerList.advancePlayer();
        expect(playerList.currentPlayer).toBe(player3);
        playerList.advancePlayer();
        expect(playerList.currentPlayer).toBe(player1);
    });

    it("removing a player other than the current player should not change the current player",
        () => {
            playerList.addPlayer(player1);
            playerList.addPlayer(player2);
            playerList.addPlayer(player3);
            playerList.advancePlayer();
            expect(playerList.currentPlayer).toBe(player2);
            playerList.removePlayer(socket1);
            expect(playerList.currentPlayer).toBe(player2);
            playerList.removePlayer(socket3);
            expect(playerList.currentPlayer).toBe(player2);
            // removing the last player should leave the current player undefined
            playerList.removePlayer(socket2);
            expect(playerList.currentPlayer).toBeUndefined();
        });

        it("removing the current player should advance to the next player in the list",
            () => {
                playerList.addPlayer(player1);
                playerList.addPlayer(player2);
                playerList.addPlayer(player3);
                playerList.advancePlayer();
                expect(playerList.currentPlayer).toBe(player2);
                playerList.removePlayer(socket2);
                expect(playerList.currentPlayer).toBe(player3);                
               });

    it("should return the number of players in the list", () => {
        playerList.addPlayer(player1);
        playerList.addPlayer(player2);
        playerList.addPlayer(player3);
        expect(playerList.nPlayers()).toBe(3);
    });

    
});