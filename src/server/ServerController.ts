// import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { ServerSocket, ClientToServerEvents, ServerToClientEvents } from '../shared/types'
import NimGame from "./NimGame";
import { Player } from "../shared/types";
import { nanoid } from 'nanoid';



// // only listen to requests from localhost:3000.  Not sure if this is necessary
// const corsParams = {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
// }

// // get this working first, then refactor into a controller...

// const httpServer = createHttpServer();
// const io = new Server<ClientToServerEvents, ServerToClientEvents>
//     (httpServer, { cors: corsParams });

// `game` is the single source of truth for the game state
// const game = new NimGame(20, 3);
// let gameNumber = 0

export default class ServerController {
    private game: NimGame 
    private io: Server<ClientToServerEvents, ServerToClientEvents>
    private socket: ServerSocket //Server<ClientToServerEvents, ServerToClientEvents,
   
    private gameNumber = 0
    constructor(
        game: NimGame, 
        io: Server<ClientToServerEvents, ServerToClientEvents>,
        _socket: ServerSocket
    
    ) {
        this.game = game;
        this.io = io;
        this.socket = _socket;
        console.log('new serverController created')
        this.setupEventHandlers();        
    }


private setupEventHandlers ()
    {
        this.socket.on("helloFromClient", this.helloFromClientHandler.bind(this))
        this.socket.on("clientTakesMove", this.clientTakesMoveHandler.bind(this))
        this.socket.on("disconnect", () => {
            // remove this client from the game
            this.game.removePlayer(this.socket);
            console.log('server reports disconnect', { nclients: this.game.nPlayers })
            console.log('controller.ts: clientNames', this.game.playerNames)
        })
    }

    
    
    private helloFromClientHandler(clientName: string): void {
        console.log('\nserver received helloFromClient', clientName)
        const playerID = nanoid(6);
        this.game.addPlayer({ name: clientName, playerID: playerID, socket: this.socket });
        console.log(`controller.ts: ${clientName} assigned ID ${playerID}`)
        this.socket.emit('assignID', playerID);
        console.log('controller.ts: clientNames', this.game.playerNames)
        // this.io.emit('serverAnnounceNewClient', clientName);
        if ((this.game.nPlayers > 1) && !this.game.isGameInProgress) {
            this.startGame();
        }
    }

    // client takes a turn
    // we know which client this is: it's the one at the other end of the socket
    private clientTakesMoveHandler(move: number): void {
        const player = this.getPlayerFromSocket(this.socket) as Player;
        console.log('\nserver received clientMove', player.name, move)
        // console.log('controller.ts: movesLeft = ', movesLeft)
        // console.log('game.currentPlayer', game.currentPlayer?.name, game.currentPlayer?.playerID)
        try {
            // console.log('entering try block')
            this.game.move(player, move);  // throws an error if the move is invalid
            console.log('controller.ts: sticks left', this.game.pile())
            if (this.game.isGameOver) {
                this.handleGameOver(player, move)
            }
            else { this.requestNextMove(this.socket) }
        }
        catch (errMsg: any) {
            console.log('controller.ts: clientTakesMove error', player.name, move, errMsg.message)
            this.requestNextMove(this.socket)
        }
    }
    
    // when the game is over, announce the winner and start a new game   
    private handleGameOver(player: Player, move: number) {
        if (this.game.isGameOver) {
            console.log('serverAnnounceWinner', player.name, player.playerID);
            this.startGame();
        }
    }

    private callback() {
        this.game.advanceIndex();
        const nextPlayer = this.game.currentPlayer as Player;  // could maybe cast this to Player
        const nextPlayerSocket = nextPlayer?.socket;
        console.log('controller.ts: nextPlayer is', nextPlayer?.name, nextPlayer?.playerID)
        nextPlayerSocket?.emit('yourTurn', this.gameNumber, this.game.pile());
    }

   private requestNextMove(socket: ServerSocket) {
        // wait 1000 ms before sending the next player their turn        
        setTimeout(this.callback, 1000)
    
    }
    
   public startGame() {
        this.game.resetGame();  // sets the pile to 20 and the current player to 0
        console.log('controller.ts: starting new game', this.gameNumber)
        // get the socket of the current player and tell them it's their turn
        const player0socket = this.game.currentPlayer?.socket;
        player0socket?.emit('yourTurn', this.gameNumber, this.game.pile());
    }
    
    private getPlayerFromSocket(socket: ServerSocket) {
        return this.game.players.find(p => p.socket === socket)
    }
    
    
        


    }












