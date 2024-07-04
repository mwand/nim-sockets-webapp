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
export type PlayerName = string

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

export type GameStatus = {
    gameInProgress: boolean,
    boardState: BoardState,
    nextPlayerName: PlayerName | undefined
    nextPlayerID: PlayerID | undefined
}






export type Strategy = (boardState: BoardState) => Move

// the controller listens to the GameEvents 
// and to events from the client,
// and sends appropriate message to the game.



// protocol:
// client sends helloFromClient
// server sends assignID
// when there are at least two clients, 

// don't send items of type Player over the wire!

export interface ServerToClientEvents {

    // controller assigns an id to a client
    // assignID: (playerID: string) => void;
    assignID: (playerID: string, gameStatus:GameStatus) => void;

    // controller tells a client that it is their turn.
    yourTurn: (gameNumber: GameNumber, boardState: BoardState) => void;

    // game tells each registered client that the game has started
    newGame: (gameNumber: GameNumber, boardState: BoardState) => void;

    // Announcements: generally sent to io, not to individual clients

    // controller announces that a player has joined the game
    serverAnnounceNewClient: (playerName: string, playerID: PlayerID) => void;
    
    // controller announces the names of all the players
    // do this after each player joins, also when a player requests it
    serverAnnouncePlayerNames: (playerNames: string[]) => void;

    // controller announces that a player has moved.
    serverAnnouncePlayerMoved: (playerName: string, 
        move: Move, 
        moveAccepted: boolean,
        resultingBoardState:BoardState, 
        nextPlayerName:string) => void;  

    // controller announces that the game status has changed
    // this is "REST over WS"
        serverAnnounceStatusChanged: (reason: string, gameStatus: GameStatus) => void;
        
    // controller announces winner
    serverAnnounceWinner: (playerName: string, playerID: string) => void;

    // controller announces that it is shutting down
    // a player should disconnect.
    serverAnnounceHasNoMoreMoves: () => void;
}

export interface ClientToServerEvents {

    // client requests to join server
    helloFromClient: (clientName: string) => void;

    // client tells the server its move
    clientTakesMove: (move: Move) => void;

    // client tells the server it is disconnecting
    clientDisconnect: (clientName:string) => void;

}


