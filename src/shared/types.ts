// shared types

// import TypedEmitter from "typed-emitter";
import { Server, Socket } from "socket.io";


export type Move = number;
export type BoardState = number;
export type GameNumber = number
export type TurnID = number

export type GameState = {boardState: BoardState, nextTurnID: TurnID, currentPlayer: IPlayer}

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>

// do we really need this?
export interface INimController {

    addPlayer(player: IPlayer): void;
    // replaced by emitter. 
    // addListener(listener: Listener): void;
    newGame(): void;
}

export interface IPlayer {
    name: string;
    socket?: Socket<ClientToServerEvents, ServerToClientEvents>; // the socket to the client
}

export interface IPlayerList {
    addPlayer(player: IPlayer): void;
    nextPlayer: IPlayer;
    nPlayers: number;
}

export type Player = {name: string, socket: Socket<ClientToServerEvents, ServerToClientEvents>} 


export interface ServerToClientEvents {


    // controller announces that a player has joined the game
    playerJoined: (playerName: string) => void;

    // controller announces that it is starting a new game
    newGame: (gameNumber:GameNumber) => void;

    // controller announces that a player has moved.
    playerMoved: (gameNumber:GameNumber, player: IPlayer, move: Move, newState: BoardState) => void;

    // controller announces the player's move and the new state of the game.
    gameStateChanged: (gameState:GameState) => void;

    // controller announces the winner of the game
    playerWon: (gameNumber:GameNumber, player: IPlayer) => void;  
}

export interface ClientToServerEvents {

    // client requests to join server
    helloFromClient: (clientName: string) => void;

    // client tells the server its move
    clientTakesMove: (clientName: string, turnID: TurnID, move: Move) => void;

}

export type ScoreboardLine = {name: string, wins: number}
export type Scoreboard = ScoreboardLine[]

export interface IScoreboard {
    // constructor(controller: INimController);
    start(): void; // resets the scoreboard and starts listening to the controller
    stop(): void; // stops listening to the controller
    scoreboard: Scoreboard; // the scoreboards
}

// this should be defined in scripts:
// outputScoreboard(s:Scoreboard) => void; // outputs the scoreboard to the console