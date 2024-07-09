"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Heading, VStack, Box } from '@chakra-ui/react';

import { PlayerID, GameNumber, BoardState, Move } from '@/shared/types';
import type { ClientSocket, GameStatus } from "../../shared/types";

import YourMoveForm from './YourMoveForm';

function nextPlayerName (gameStatus: GameStatus | undefined, thisPlayerID:string) : string { 
  return (
  (gameStatus?.nextPlayerName === undefined || gameStatus?.gameInProgress === false) 
  ? "waiting for start" 
  : (gameStatus?.nextPlayerID === thisPlayerID)
  ? "YOUR TURN!"
  : gameStatus.nextPlayerName
  )
}

function GameStatusMessage(gameStatus: GameStatus | undefined, playerID: PlayerID | undefined){

  useEffect(() => {
  console.log("gameStatus", gameStatus);
  }, [gameStatus]);

  if (gameStatus !== undefined){
  return (
    <VStack align="left">      
      <Box>Board State: {gameStatus.boardState}</Box>
      <Box>Next Player: {nextPlayerName(gameStatus,playerID as string)}</Box>
    </VStack>
  );
} }


// need something better than this 
// <Box>Game In Progress: {gameStatus.gameInProgress.toString()}</Box>


export default function PostLoginPage(props: {
  playerName: string;
  socket: ClientSocket;
}) {
  const [socket, _] = useState<ClientSocket>(props.socket);
  const [boardState, setBoardState] = useState<BoardState | undefined>(
    undefined
  );
  const [playerID, setPlayerID] = useState<PlayerID | undefined>(undefined);
  const [gameStatus, setGameStatus] = useState<GameStatus | undefined>(
    undefined
  );


  function yourMove() {
    return (gameStatus?.nextPlayerID === playerID && gameStatus?.gameInProgress);
  }
  // set up event handlers
  useEffect(() => {
    socket.on("yourTurn", handleYourTurn);
  
    socket?.on("assignID", (playerID: PlayerID, gameStatus: GameStatus) => {
      console.log(`client received assignID ${playerID}`);
      console.log("playerID", playerID);
      console.log("received gameStatus", gameStatus);
      setPlayerID((_) => playerID);
      setGameStatus(gameStatus);
      setBoardState((_) => gameStatus.boardState);
    });

    socket.on(
      "serverAnnounceStatusChanged",
      (reason: string, gameStatus: GameStatus) => {
        setGameStatus((_) => gameStatus);
      }
    );
  }, [socket]);

  // this results in a window consisting entirely of the player's name,
  // no other data.  Maybe needs to use the Navigation component?
  // useEffect(() => {
  //   window.document.title = `Player ${props.playerName}`;
  // })

  function handleYourTurn(gameNumber: GameNumber, boardState: BoardState) {
      setBoardState((_) => boardState);
  }

  
  

  return (
    <VStack>
      <Heading>
        Player {props.playerName} (ID: {playerID}){" "}
      </Heading>
      <VStack align="left">
        {GameStatusMessage(gameStatus,playerID)}
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
