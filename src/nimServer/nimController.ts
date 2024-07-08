// import { createServer as createHttpServer } from "http";
import { DisconnectReason, Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player, GameEvent, Move, moveResponse } from "../shared/types";
import { nanoid } from 'nanoid';

// each controller is responsible for one client.

export default class ServerController {
    private _game: NimGame
    private _io: Server<ClientToServerEvents, ServerToClientEvents>
    private _socket: ServerSocket //Server<ClientToServerEvents, ServerToClientEvents>
    private _player: Player | undefined

    private get playerName() { return this._player?.name }

    private gameNumber = 0
    constructor(
        game: NimGame,
        io: Server<ClientToServerEvents, ServerToClientEvents>,
        socket: ServerSocket

    ) {
        this._game = game;
        this._socket = socket;
        this._io = io;
        console.log('new controller created')
        console.log('current players:', this._game.playerNames)
        this.setupEventHandlers();
    }


    private setupEventHandlers() {        
        console.log('setting up event handlers')    
        this._socket.on("helloFromClient", this.helloFromClientHandler.bind(this))
        this._socket.on("clientTakesMove", this.clientTakesMoveHandler.bind(this))

    }

    public disconnect() {
        console.log(`controller[${this.playerName}] received disconnect on its socket`)
        console.log({currentPlayers: this._game.playerNames})
        console.log('controller removing player', this.playerName)
        // remove this client from the game
        this._game.removePlayer(this._socket);
        console.log(`controller[${this.playerName}] remaining playerNames:`, this._game.playerNames)
    }


    private helloFromClientHandler(clientName: string): void {
        console.log(`controller[${clientName}]: received helloFromClient ${clientName}`)
        const playerID = nanoid(6);
        this._player = { name: clientName, playerID: playerID, socket: this._socket }
        console.log(`controller[${clientName}]: ${clientName} assigned ID ${playerID}`)
        console.log(`controller[${clientName}]: current players:`, this._game.playerNames)
        console.log(`controller[${clientName}]: emitting gameStatus:`, this._game.gameStatus)
        // tell the client their ID and the current state of the game
        this._socket.emit('assignID', playerID, this._game.gameStatus);
        // this._io.emit('serverAnnounceNewClient', clientName, playerID);
        // this._io.emit('serverAnnouncePlayerNames', this._game.playerNames)        
        // addPlayer starts the game as soon as there are two players
        this._game.addPlayer(this._player);
        console.log(`controller[${clientName}] playerNames:`, this._game.playerNames)

    }


    // client takes a turn
    // we know which client this is: it's the one at the other end of the socket
    private clientTakesMoveHandler(move: number): void {
        const player = this._player as Player
        console.log('\nserver received clientMove', player?.name, move)
        const { moveAccepted, isGameOver, nextPlayer, resultingBoardState } = this._game.move(player, move);
        this._io.emit('serverAnnouncePlayerMoved', 
            player.name, move, moveAccepted, resultingBoardState, nextPlayer.name)
        if (moveAccepted) {
                console.log(`controller.ts: ${player.name} moved ${move} sticks, leaving ${resultingBoardState} sticks in the pile.`)
            } else {
                console.log(`controller.ts: ${player.name} tried to move ${move} sticks, which was illegal.`)
                console.log(`there are still ${resultingBoardState} sticks in the pile.`)
            }
        if (isGameOver) {
            this.handleGameOver(player, move)
        }
        else { this.requestNextMove(nextPlayer.socket) }
    }

    // when the game is over, announce the winner and start a new game
    private handleGameOver(player: Player, move: number) {
        console.log('serverAnnounceWinner', player.name, player.playerID);
        this.gameNumber++;
        // this._io.emit('serverAnnounceWinner', player.name, player.playerID);
        // putting a setTimeout here doesn't work, 
        // because the page is reloaded before the timeout expires, and there's no emit
        // so the page doesn't refresh.
        // Exercise: how could you fix this?
        this._game.startGame(player), 1000;
    }

    // tell the next player it's their turn, but wait a second.
    private requestNextMove(nextPlayerSocket: ServerSocket) {
        // wait 1000 ms before sending the next player their turn        
        setTimeout(this.callback(nextPlayerSocket), 1000)
    }

    private callback(nextPlayerSocket: ServerSocket) {
        return () => {
            // console.log('controller.ts: nextPlayer is', nextPlayer?.name, nextPlayer?.playerID)
            nextPlayerSocket.emit('yourTurn', this.gameNumber, this._game.boardState);
        }
    }



}












