"use client"
import * as React from 'react';
import { ChakraProvider, VStack } from '@chakra-ui/react';

import {
  PlayerID,
  BoardState,
  GameNumber,
  GameStatus,
  Player,
  Move,
  Strategy,
} from "../../../shared/types";  // is there a better idiom for this?
import type { ClientSocket } from "../../../shared/types";
import io from "socket.io-client";
import LoginPage from './NimLogin';
import PostLoginPage from './PostLogin';

import { useEffect, useState } from "react";
import { Heading, Box, Button } from "@chakra-ui/react";


export default function NimApp () {
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [playerID, setPlayerID] = useState<PlayerID | undefined>(undefined);
  const [playerName, setPlayerName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<GameStatus | undefined>(undefined);

  const SERVICEURL = 'nim-sockets-webapp-backend'



  // on first render, connect to the server (just like bareBones.tsx)
  useEffect(() => {
    // const socket1 = io("ws://localhost:8080");
    const socket1 = io("ws://" + SERVICEURL + ":8080");
    setSocket(_ => socket1); 
    setIsConnected(_ => true);
    return () => {
      // is anybody listening for this?
      // socket1.emit('clientDisconnect', playerID)
      socket1.disconnect();
    };
  }, []);

  

  // moving this to the PostLogin component
  // once socket is set up, send a helloFromClient message
  // and wait(?) for the server to assign an ID
  // useEffect(() => {    
  //   socket?.on("assignID", (playerID: PlayerID) => {
  //     console.log(`client received assignID ${playerID}`)
  //     console.log('playerID', playerID)
  //    // console.log('received gameStatus', gameStatus)
  //     setPlayerID(_ => playerID);
  //    //  setGameStatus(gameStatus)
  //   });
  // }, [socket]);


  if (!playerName) {
    return <LoginPage setPlayerName={setPlayerName} socket={socket as ClientSocket} />;
  } else {
    return (
      <PostLoginPage
        playerName={playerName}  
        socket={socket as ClientSocket}
        
      />
    );
  }

  
}

// playerID={playerID as string} // playerID should be defined at this point.
// gameStatus={gameStatus as GameStatus}

// Button.defaultProps = {
//   textColor: "red",
//   border: "2px",
//   borderColor: "black",
// }

// Box.defaultProps = {
//   border: "2px",
//   borderColor: "green",
//   padding: "1",
// }

