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
export type PlayerID = string

export type Player = {
    name: string;
    playerID: string; // unique id for this player
    socket: ServerSocket // the server end of the  socket for this client
}

export interface IPlayerList {
    players: Player[];  // this is a get property
    addPlayer(player: Player): void;
    removePlayer(socket: ServerSocket): void;
    nPlayers(): number;
    currentPlayer: Player | undefined;  // implemented as a get property?
    advancePlayer(): void;  // throws error if no players
}

export interface INimGame {
    addPlayer(player: Player): void;
    removePlayer(socket: ServerSocket): void;
    
    // the game starts itself as soon as there are two players
    boardState: BoardState;
    move: (player: Player, move: Move) => moveResponse; // rejects move if not player's turn 
    // should it throw an error instead if it's not the player's turn?? 
    isGameOver: boolean;
}

export type moveResponse = {
    moveAccepted: boolean,
    isGameOver: boolean,
    player: Player, 
    move: Move, 
    resultingBoardState:BoardState, 
    nextPlayer:Player  // if game is over, this is the first player in the next game.
}

// whose responsibility is it to notify the next player that it's their turn?



// no, the game just responds to its controller
export type GameEvents = {
    cantStartGame: () => void;  // not enough players
    gameStarted: (gameNumber: GameNumber) => void;
    moveAccepted: (player: Player, move: Move, resultingBoardState:BoardState, nextPlayer:Player) => void;
    moveRejected: (player: Player, move: Move, resultingBoardState:BoardState, nextPlayer:Player) => void;
    playerWon: (player: Player) => void;
}

export type Strategy = (boardState: BoardState) => Move

// the controller listens to the GameEvents 
// and to events from the client,
// and sends appropriate message to the game.
export interface INimControllerIgnored {

    // starting with CoPilot's idea of a minimal protocol

    // client requests to join server
    helloFromClient: (clientName: string) => void;

    // client responds to 'newgame' by telling the server it would like to join 
    // the game; assumes this client is already in the game
    clientJoinsGame: (clientName: Player) => void;

    // client tells the server its move
    clientTakesMove: (move: Move) => void;

    // controller announces that a player has joined the game
    playerJoined: (playerName: string) => void;

    // controller assigns an id to a client
    assignID: (playerID: string) => void;

    // controller announces winner
    serverAnnounceWinner: (playerName: string, playerID: string) => void;

    // controller announces that it is starting a new game
    newGame: (gameNumber:GameNumber) => void;

    // controller tells a client that it is their turn.
    yourTurn: (gameNumber:GameNumber, boardState:number) => void;

    // controller tells a client that it is not their turn
    notYourTurn: (gameNumber:GameNumber, playerID: Player) => void;

    // controller tells a client that the move they made was invalid
    // it is still this player's turn
    invalidMove: (gameNumber:GameNumber, playerID: PlayerID, move: Move) => void;

    // controller announces that a player has moved.
    playerMoved: (gameNumber:GameNumber, player: Player, move: Move, newState: BoardState) => void;

    // controller announces the winner of the game
    playerWon: (gameNumber:GameNumber, player: Player) => void;
    
    // controller announces that it is shutting down
    // a player should disconnect.
    serverHasNoMoreMoves: () => void;
}


// protocol:
// client sends helloFromClient
// server sends assignID
// when there are at least two clients, server starts the first game
// when the game is over, server starts a new game with the same players
// player[0] always goes first.
// server sends yourTurn to the current player
// client sends clientTakesMove
// sends no response, but moves to next player regardless of whether the move was valid.

// this is the minimal protocol for a game of nim.
// the player only sees the board when it's his move.
// we could add other events, like playerWon, playerLost, etc.


export interface ServerToClientEvents {

    // nah, don't need this
    // controller announces that a player has joined the game
    serverAnnounceNewClient: (playerName: string) => void;

    // controller assigns an id to a client
    assignID: (playerID: string) => void;

    // controller announces winner
    serverAnnounceWinner: (playerName: string, playerID: string) => void;

    // // controller announces that it is starting a new game
    // newGame: (gameNumber:GameNumber) => void;

    
    // controller tells a client that it is their turn.
    yourTurn: (gameNumber:GameNumber, boardState:number) => void;

    // exercise: add these events
    // controller tells a client that it is not their turn
    // notYourTurn: (gameNumber:GameNumber, playerID: Player) => void;

    // // controller tells a client that the move they made was invalid
    // // it is still this player's turn
    // invalidMove: (gameNumber:GameNumber, playerID: PlayerID, move: Move) => void;

    // // controller announces that a player has moved.
    // playerMoved: (gameNumber:GameNumber, player: Player, move: Move, newState: GameState) => void;

    // // controller announces the winner of the game
    // playerWon: (gameNumber:GameNumber, player: Player) => void;
    
    // controller announces that it is shutting down
    // a player should disconnect.
    serverHasNoMoreMoves: () => void;
}

export interface ClientToServerEvents {

    // client requests to join server
    helloFromClient: (clientName: string) => void;

    // // client responds to 'newgame' by telling the server it would like to join 
    // // the game; assumes this client is already in the game
    // clientJoinsGame: (clientName: Player) => void;

    // client tells the server its move
    clientTakesMove: (move: Move) => void;

}


