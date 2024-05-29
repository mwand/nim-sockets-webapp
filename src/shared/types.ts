// shared types

// import TypedEmitter from "typed-emitter";
import { Socket as _ServerSocket } from "socket.io";
import { Socket as _ClientSocket } from "socket.io-client";

export type ServerSocket = _ServerSocket<ClientToServerEvents, ServerToClientEvents>
export type ClientSocket = _ClientSocket<ServerToClientEvents, ClientToServerEvents>;

export type Move = number;
export type BoardState = number;
export type GameNumber = number
export type TurnID = number

export type Player = {
    name: string;
    socket?: ServerSocket // optional: the server's socket for this client
    // do ever use this??
}

/** The state of the game, as a data-transfer object */
export type GameState = {
    gameNumber: GameNumber,
    boardState: BoardState,  
    nextTurnID: TurnID,        
    nextPlayer: Player}

export type Strategy = (boardState: BoardState) => Move

// do we really need this?
export interface INimController {

    addPlayer(player: Player): void;
    // replaced by emitter. 
    // addListener(listener: Listener): void;
    newGame(): void;
}



// we may want to be able to remove a player as well.
export interface IPlayerList {
    addPlayer(player: Player): void;
    nPlayers: number;
    currentPlayer: Player | undefined;
    nextPlayer(): void;
}




export interface ServerToClientEvents {

    // controller announces that a player has joined the game
    playerJoined: (playerName: string) => void;

    // controller announces winner
    serverAnnounceWinner: (player: Player) => void;

    // controller announces that it is starting a new game
    newGame: (gameNumber:GameNumber) => void;

    
    // controller tells a client that it is their turn.
    yourTurn: (gameNumber:GameNumber, boardState:number) => void;

    // exercise: add these events
    // controller tells a client that it is not their turn
    // notYourTurn: (gameNumber:GameNumber, player: Player) => void;

    // controller tells a client that the move they made was invalid
    // it is still this player's turn
    invalidMove: (gameNumber:GameNumber, player: Player, move: Move) => void;

    // controller announces that a player has moved.
    playerMoved: (gameNumber:GameNumber, player: Player, move: Move, newState: GameState) => void;

    // controller announces the winner of the game
    playerWon: (gameNumber:GameNumber, player: Player) => void;  
}

export interface ClientToServerEvents {

    // client requests to join server
    helloFromClient: (clientName: string) => void;

    // client tells the server its move
    clientTakesMove: (player:Player, move: Move) => void;

}

