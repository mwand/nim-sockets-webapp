import NimGame from './NimGame';
import PlayerList from './PlayerList';

describe('NimGame', () => {
    let nimGame: NimGame;
    let players: PlayerList;

    beforeEach(() => {
        players = new PlayerList();
        nimGame = new NimGame(10, 3, players);
    });

    it('should initialize a new game with the correct pile and limit', () => {
        expect(nimGame.getPile()).toBe(10);
        expect(nimGame.isGameOver()).toBe(false);
    });

    it('should add a player to the game', () => {
        const player = { name: 'Alice' };
        nimGame.addPlayer(player);
        const players = nimGame.getPlayers();
        expect(players.playerList.length).toBe(1);
        expect(players.currentPlayer).toBe(player);
    });

    // commenting out this test doesn't cause stryker to report any more surviving mutants !?!
    it('should switch to the next player after taking sticks', () => {
        const player1 = { name: 'Alice' };
        const player2 = { name: 'Bob' };
        const player3 = { name: 'Charlie' };
        nimGame.addPlayer(player1);
        nimGame.addPlayer(player2);
        nimGame.addPlayer(player3);
        nimGame.move(player1, 1);
        nimGame.move(player2, 2);
        nimGame.move(player3, 1);
        expect(nimGame.getPile()).toBe(6);
        expect(nimGame.getCurrentPlayer()).toBe(player1);
    });

    it('should throw an error if the number of sticks to take is invalid', () => {
        const player = { name: 'Alice' };
        nimGame.addPlayer(player);
        expect(() => nimGame.move(player, 0)).toThrow('Game not in progress');
        const player2 = { name: 'Bob' };
        nimGame.addPlayer(player2);
        expect(() => nimGame.move(player, 4)).toThrow('Invalid number of sticks');
        expect(() => nimGame.move(player, 11)).toThrow('Invalid number of sticks');
    });

    it('should end the game when the pile is empty', () => {
        const player1 = { name: 'Alice' };
        const player2 = { name: 'Bob' };
        nimGame = new NimGame(4, 3, new PlayerList());
        nimGame.addPlayer(player1);
        nimGame.addPlayer(player2)
        nimGame.move(player1, 3);
        expect(nimGame.isGameOver()).toBe(false);
        nimGame.move(player2, 1);
        expect(nimGame.isGameOver()).toBe(true);
    });
});