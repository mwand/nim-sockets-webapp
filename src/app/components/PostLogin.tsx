"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Heading, VStack, Box } from '@chakra-ui/react';

import { PlayerID, GameNumber, BoardState, Move } from '@/shared/types';
import type { ClientSocket, GameStatus } from "../../shared/types";

import YourMoveForm from './YourMoveForm';

function nextPlayerName(gameStatus: GameStatus | undefined): string {
  if (gameStatus?.nextPlayerName === undefined) {
    return "waiting for start";
  } else {
    return gameStatus.nextPlayerName;
  }
}

function displayGameStatusMessage(gameStatus: GameStatus | undefined){

  useEffect(() => {
  console.log("gameStatus", gameStatus);
  }, [gameStatus]);

  if (gameStatus !== undefined){
  return (
    <VStack align="left">
      <Box>Game In Progress: {gameStatus.gameInProgress.toString()}</Box>
      <Box>Board State: {gameStatus.boardState}</Box>
      <Box>Next Player: {nextPlayerName(gameStatus)}</Box>
    </VStack>
  );
} }

  
export default function PostLoginPage(props: {
  playerName: string;
//  playerID: PlayerID;
//  gameStatus:GameStatus
  socket: ClientSocket;
}) {
  const [socket, _] = useState<ClientSocket>(props.socket);
   const [boardState, setBoardState] = useState<BoardState | undefined>(
    undefined
  );
  const [playerID, setPlayerID] = useState<PlayerID | undefined>(undefined);
  const [gameStatus, setGameStatus] = useState<GameStatus | undefined>(undefined);
  // const [yourMove, setYourMove] = useState<boolean>(false);


  function yourMove() {
    return gameStatus?.nextPlayerID === playerID;
  }
  // set up event handlers
  useEffect(() => {
    socket.on("yourTurn", handleYourTurn);
    // socket.on("newGame", handleNewGame);
    // socket.on("serverAnnounceNewClient", handleServerAnnounceNewClient);
    // socket.on("serverAnnouncePlayerMoved", handleServerAnnouncePlayerMoved);
    // socket.on("serverAnnounceWinner", handleServerAnnounceWinner);

    socket?.on("assignID", (playerID: PlayerID, gameStatus: GameStatus) => {
      console.log(`client received assignID ${playerID}`);
      console.log("playerID", playerID);
      console.log("received gameStatus", gameStatus);
      setPlayerID((_) => playerID);
      setGameStatus(gameStatus);
    });

    socket.on(
      "serverAnnounceStatusChanged",
      (reason: string, gameStatus: GameStatus) => {
        console.log(`serverAnnounceStatusChanged: ${reason}`);
        console.log("gameStatus", gameStatus);
        setGameStatus((_) => gameStatus);
      }
    );
  }, [socket]);

  function handleNewGame(gameNumber: GameNumber, boardState: BoardState) {
   // setGameStatusMessage((_) => `Game ${gameNumber} started!`);
    setBoardState((_) => boardState);
  }

  function handleYourTurn(gameNumber: GameNumber, boardState: BoardState) {
   // setGameStatusMessage((_) => `Your turn!`);
    // setYourMove((_) => true);
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
      <Heading>
        Player {props.playerName} (ID: {playerID}){" "}
      </Heading>
      <VStack align="left">
        {displayGameStatusMessage(gameStatus)}
        {(yourMove()) ? (
          <YourMoveForm
            maxMove={boardState as number}
            onSubmit={(move) => {
              socket.emit("clientTakesMove", move);
              // setYourMove(false);
            }}
          />
        ): null}
      </VStack>
    </VStack>
  );
}
