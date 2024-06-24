// import { createServer as createHttpServer } from "http";
import { DisconnectReason, Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import { nanoid } from 'nanoid';

type Player = {name: string, playerID: string, socket: ServerSocket}

// each controller is responsible for one client.

// all this controller does

export default class BareBonesController {

    private _io: Server<ClientToServerEvents, ServerToClientEvents>
    private _socket: ServerSocket //Server<ClientToServerEvents, ServerToClientEvents>
    private _player: Player | undefined

    private get playerName() { return this._player?.name }

    private gameNumber = 0
    constructor(
        io: Server<ClientToServerEvents, ServerToClientEvents>,
        socket: ServerSocket

    ) {
        this._socket = socket;
        this._io = io;
        console.log('new controller created')
        console.log('current players:', this._game.playerNames)
        this.setupEventHandlers();
    }


    private setupEventHandlers() {
        
        console.log('setting up event handlers')
    
        // this._socket.on("helloFromClient", this.helloFromClientHandler.bind(this))
        // this._socket.on("clientTakesMove", this.clientTakesMoveHandler.bind(this))
        this._socket.on("disconnect", () => this.handleDisconnect.bind(this))
        // this._io.on("disconnect", () => this.handleDisconnect.bind(this))
    }

    private handleDisconnect(){
        console.log(`controller[${this.playerName}] received disconnect on its socket`, 
            { nclients: this._game.nPlayers() })
        console.log('server removed player', { nclients: this._game.nPlayers() })
        // console.log('server received disconnect on a socket', { reason })
        // remove this client from the game
        this._game.removePlayer(this._socket);
       
        // console.log('controller.ts: clientNames', this._game.playerNames)
    }

    private helloFromClientHandler(clientName: string): void {
        console.log(`controller[${clientName}]: received helloFromClient ${clientName}`)
        const playerID = nanoid(6);
        this._player = { name: clientName, playerID: playerID, socket: this._socket }
        console.log(`controller[${clientName}]: ${clientName} assigned ID ${playerID}`)
        // tell the client their ID
        this._socket.emit('assignID', playerID);
        this._io.emit('serverAnnounceNewClient', clientName, playerID);
        this._io.emit('serverAnnouncePlayerNames', this._game.playerNames)        
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
            player.name, move, resultingBoardState, nextPlayer.name)
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












