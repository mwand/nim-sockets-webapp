// import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player, Move, moveResponse } from "../shared/types";
import { nanoid } from 'nanoid';

// each controller is responsible for one client.

export default class ServerController {
    private _game: NimGame
    private _io: Server<ClientToServerEvents, ServerToClientEvents>
    private _socket: ServerSocket //Server<ClientToServerEvents, ServerToClientEvents>
    private _player: Player | undefined

    private gameNumber = 0
    constructor(
        game: NimGame,
        io: Server<ClientToServerEvents, ServerToClientEvents>,
        socket: ServerSocket

    ) {
        this._game = game;
        this._socket = socket;
        this._io = io;
        console.log('new serverController created')
        this.setupEventHandlers();
    }


    private setupEventHandlers() {
        this._socket.on("helloFromClient", this.helloFromClientHandler.bind(this))
        this._socket.on("clientTakesMove", this.clientTakesMoveHandler.bind(this))
        this._socket.on("disconnect", () => this.handleDisconnect.bind(this))
    }

    private handleDisconnect() {
        // remove this client from the game
        this._game.removePlayer(this._socket);
        console.log('server reports disconnect', { nclients: this._game.nPlayers })
        // console.log('controller.ts: clientNames', this._game.playerNames)
    }

    private helloFromClientHandler(clientName: string): void {
        console.log('\nserver received helloFromClient', clientName)
        const playerID = nanoid(6);
        this._player = { name: clientName, playerID: playerID, socket: this._socket }
        console.log(`controller.ts: ${clientName} assigned ID ${playerID}`)
        // tell the client their ID
        this._socket.emit('assignID', playerID);
        this._io.emit('serverAnnounceNewClient', clientName);
        // addPlayer starts the game as soon as there are two players
        this._game.addPlayer(this._player);
    }


    // client takes a turn
    // we know which client this is: it's the one at the other end of the socket
    private clientTakesMoveHandler(move: number): void {
        const player = this._player as Player
        console.log('\nserver received clientMove', player?.name, move)
        const { moveAccepted, isGameOver, nextPlayer } = this._game.move(player, move);
        console.log('controller.ts: sticks left', this._game.pile())
        if (isGameOver) {
            this.handleGameOver(player, move)
        }
        else { this.requestNextMove(nextPlayer.socket) }
    }



    // when the game is over, announce the winner and start a new game
    private handleGameOver(player: Player, move: number) {
            console.log('serverAnnounceWinner', player.name, player.playerID);
            this.gameNumber++;
            this._io.emit('serverAnnounceWinner', player.name, player.playerID);
            this._game.startGame(player);
        }
    
    // tell the next player it's their turn, but wait a second.
    private requestNextMove(nextPlayerSocket: ServerSocket) {
        // wait 1000 ms before sending the next player their turn        
        setTimeout(this.callback(nextPlayerSocket), 1000)

    }

    private callback(nextPlayerSocket: ServerSocket) {
        return () => {
            // console.log('controller.ts: nextPlayer is', nextPlayer?.name, nextPlayer?.playerID)
            nextPlayerSocket.emit('yourTurn', this.gameNumber, this._game.pile());
        }
    }



    // public startGame() {
    //     this._game.resetGame();  // sets the pile to 20 and the current player to 0
    //     console.log('controller.ts: starting new game', this.gameNumber)
    //     // get the socket of the current player and tell them it's their turn
    //     const player0socket = this._game.currentPlayer?.socket;
    //     player0socket?.emit('yourTurn', this.gameNumber, this._game.pile());
    // }







}












