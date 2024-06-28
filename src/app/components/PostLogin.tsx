"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Heading, VStack, Box } from '@chakra-ui/react';

import { PlayerID, GameNumber, BoardState, Move } from '@/shared/types';
import type { ClientSocket, GameStatus } from "../../shared/types";

import YourMoveForm from './YourMoveForm';


function displayGameStatusMessage(gameStatus: GameStatus){
  console.log('starting createGameStatusMessage')
  console.log("gameStatus", gameStatus);
  return (
    <VStack>
      <Box>Game In Progress: {gameStatus.gameInProgress ? "Yes" : "No"}</Box>
      <Box>Board State: {gameStatus.boardState}</Box>
      <Box>Next Player: {gameStatus.nextPlayerName}</Box>
    </VStack>
  );
}

  
export default function PostLoginPage(props: {
  playerName: string;
  playerID: PlayerID;
  gameStatus:GameStatus
  socket: ClientSocket;
}) {
  const [socket, _] = useState<ClientSocket>(props.socket);
   const [boardState, setBoardState] = useState<BoardState | undefined>(
    undefined
  );
  const [yourMove, setYourMove] = useState<boolean>(false);

  

  

  // set up event handlers
  useEffect(() => {
    socket.on("yourTurn", handleYourTurn);
    socket.on("newGame", handleNewGame);
    // socket.on("serverAnnounceNewClient", handleServerAnnounceNewClient);
    socket.on("serverAnnouncePlayerMoved", handleServerAnnouncePlayerMoved);
    socket.on("serverAnnounceWinner", handleServerAnnounceWinner);
   
  }, [socket]);

  function handleNewGame(gameNumber: GameNumber, boardState: BoardState) {
   // setGameStatusMessage((_) => `Game ${gameNumber} started!`);
    setBoardState((_) => boardState);
  }

  function handleYourTurn(gameNumber: GameNumber, boardState: BoardState) {
   // setGameStatusMessage((_) => `Your turn!`);
    setYourMove((_) => true);
    setBoardState((_) => boardState);
  }

  function handleServerAnnouncePlayerMoved(
    playerName: string,
    move: Move,
    moveAccepted: boolean,
    resultingBoardState: BoardState,
    nextPlayerName: string
  ) {
    setBoardState((_) => resultingBoardState);
  //  // setGameStatusMessage(
  //     (_) => (moveAccepted ? 
  //       `Player ${playerName} moved ${move} sticks. Next player is ${nextPlayerName}`
  //       : `Player ${playerName} tried to move ${move} sticks, which was illegal. Next player is ${nextPlayerName}`
  //   ));
  }
  function handleServerAnnounceWinner(playerName: string, playerID: PlayerID) {
    // setGameStatusMessage((_) => `Player ${playerName} wins!`);
  }
  

  return (
    <VStack>
      <Heading>Player {props.playerName} (ID: {props.playerID}) </Heading>
      <VStack align="left">
        /**
      
    {/** <Box>Game In Progress: {props.gameStatus.gameInProgress ? "Yes" : "No"}</Box> */ 
       /** <Box> Status: {displayGameStatusMessage(props.gameStatus)}</Box> */  }
        <Box> Board State: {boardState} </Box>
        {(yourMove) ? (
          <YourMoveForm
            maxMove={boardState as number}
            onSubmit={(move) => {
              socket.emit("clientTakesMove", move);
              setYourMove(false);
            }}
          />
        ) : (
          "State: waiting for opponent"
        )}
      </VStack>
    </VStack>
  );
}
