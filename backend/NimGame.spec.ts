import NimGame from './NimGame';
import { nanoid } from 'nanoid';
import type { Player, ServerSocket  } from '../shared/types';

function mockSocket(name: string) : ServerSocket {
    return name as unknown as ServerSocket ;
}

describe('NimGame', () => {
    let nimGame: NimGame;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    const socket1 : ServerSocket = 'socket1' as unknown as ServerSocket ;

    beforeEach(() => {
        nimGame = new NimGame(10, 3);
        player1 = { name: "Alice" , playerID: nanoid(), 
            socket: mockSocket('socket1')};
        player2 = { name: "Bob" , playerID: nanoid(),
            socket: mockSocket('socket2')
        };
        player3 = { name: "Charlie" , playerID: nanoid(),
            socket: mockSocket('socket3')
        };
        nimGame.addPlayer(player1);
        nimGame.addPlayer(player2);
        nimGame.addPlayer(player3);
    });

    it('should initialize a new game with the correct pile and limit', () => {
        expect(nimGame.boardState).toBe(10);
        expect(nimGame.isGameOver).toBe(false);
    });

    it('should add players to the game', () => {   
        const players = nimGame._players;
        expect(nimGame.nPlayers).toBe(3);
        expect(nimGame.playerNames).toContain(player1.name);
    });

    it('should start with the first player in the list', () => {
        nimGame.startGame(player1);
        expect(nimGame.currentPlayer).toEqual(player1);
    });

    
    it('should switch to the next player after taking sticks', () => {
        nimGame.startGame(player1);
        expect(nimGame.boardState).toBe(10);
        expect(nimGame.currentPlayer).toBe(player1);
        nimGame.move(player1, 1);
        expect(nimGame.currentPlayer).toBe(player2);
        nimGame.move(player2, 2);
        expect(nimGame.currentPlayer).toBe(player3);
        nimGame.move(player3, 1);
        expect(nimGame.currentPlayer).toBe(player1);
        expect(nimGame.boardState).toBe(6);
       
    });

    it('should throw an error if the number of sticks to take is invalid', () => {

       
        expect(() => nimGame.move(player1, 0)).toThrow('Game not in progress');
        nimGame.startGame(player1)
        
        expect(() => nimGame.move(player1, 4)).toThrow('Invalid number of sticks');
        expect(() => nimGame.move(player1, 11)).toThrow('Invalid number of sticks');
    });

    it('should end the game when the pile is empty', () => {
        
        nimGame = new NimGame(4, 3);       
        nimGame.addPlayer(player1);
        nimGame.addPlayer(player2);
        nimGame.startGame(player1);
        nimGame.move(player1, 3);
        expect(nimGame.isGameOver).toBe(false);
        nimGame.move(player2, 1);
        expect(nimGame.isGameOver).toBe(true);
    });
});