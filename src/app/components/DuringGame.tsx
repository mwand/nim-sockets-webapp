"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Heading, VStack, Box } from '@chakra-ui/react';

import { PlayerID, GameNumber, BoardState, Move } from '@/shared/types';
import type { ClientSocket } from "../../shared/types";

import YourMoveForm from './YourMoveForm';

export default function DuringGamePage(props: {
  playerName: string;
  playerID: PlayerID;
  socket: ClientSocket;
}) {
  const [socket, _] = useState<ClientSocket>(props.socket);
  // const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("game not started");
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
    setGameStatus((_) => `Game ${gameNumber} started!`);
    setBoardState((_) => boardState);
  }

  function handleYourTurn(gameNumber: GameNumber, boardState: BoardState) {
    setGameStatus((_) => `Your turn!`);
    setYourMove((_) => true);
    setBoardState((_) => boardState);
  }

  function handleServerAnnouncePlayerMoved(
    playerName: string,
    move: Move,
    resultingBoardState: BoardState,
    nextPlayerName: string
  ) {
    setBoardState((_) => resultingBoardState);
    setGameStatus(
      (_) =>
        `Player ${playerName} moved ${move} sticks. Next player: ${nextPlayerName}`
    );
  }
  function handleServerAnnounceWinner(playerName: string, playerID: PlayerID) {
    setGameStatus((_) => `Player ${playerName} wins!`);
  }
  // function handleServerAnnouncePlayerNames(playerNames: string[]) {
  //   setPlayerNames(playerNames);
  // }

  return (
    <VStack>
      <Heading>Player {props.playerName} </Heading>
      <VStack align="left">
        <Box> Status: {gameStatus}</Box>
        <Box> Board State: {boardState} </Box>
        {yourMove ? (
          <YourMoveForm
            maxMove={boardState as number}
            onSubmit={(move) => {
              socket.emit("clientTakesMove", move);
              setYourMove(false);
            }}
          />
        ) : (
          "waiting for opponent"
        )}
      </VStack>
    </VStack>
  );
}
