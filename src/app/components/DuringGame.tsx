"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Heading, VStack, Box } from '@chakra-ui/react';

import { PlayerID, GameNumber, BoardState, Move } from '@/shared/types';
import type { ClientSocket } from "../../shared/types";

export default function DuringGamePage (
    props: {playerName:string, playerID:PlayerID, socket:ClientSocket}) {
        const [gameStatus, setGameStatus] = useState<string>("")
        const [boardState, setBoardState] = useState<BoardState | undefined> (undefined)
        const [yourMove, setYourMove] = useState<number | undefined >(0)
        const [socket, _] = useState<ClientSocket>(props.socket)
        const [playerNames, setPlayerNames] = useState<string[]>([])
    
    
    // set up event handlers
    useEffect(() => {
        socket.on("yourTurn", handleYourTurn);
        socket.on("newGame", handleNewGame);
        // socket.on("serverAnnounceNewClient", handleServerAnnounceNewClient);
        socket.on("serverAnnouncePlayerMoved", handleServerAnnouncePlayerMoved)
        socket.on("serverAnnounceWinner", handleServerAnnounceWinner);
        }, [socket]); 
        
    function handleYourTurn(gameNumber: GameNumber, boardState: BoardState) {}
    function handleNewGame(gameNumber: GameNumber) {}
    function handleServerAnnouncePlayerMoved(playerName: string, move: Move, resultingBoardState: BoardState, nextPlayerName: string) {} 
    function handleServerAnnounceWinner(playerName: string, playerID: PlayerID) {}
    function handleServerAnnouncePlayerNames(playerNames: string[]) {setPlayerNames(playerNames)}

    return (
      <VStack>
        <Heading>Player {props.playerName} </Heading>
        <VStack align="left">
        <Box> Players: {playerNames} </Box>
        <Box> Status: {gameStatus}</Box>
        <Box> Sticks remaining: {boardState} </Box>
        <Box> Your move: {yourMove} </Box>
        </VStack>
      </VStack>
    );


}