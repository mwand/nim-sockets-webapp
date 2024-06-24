"use client"
import * as React from 'react';
import { ChakraProvider, VStack } from '@chakra-ui/react';

import {
  PlayerID,
  BoardState,
  GameNumber,
  Player,
  Move,
  Strategy,
} from "../../shared/types";
import type { ClientSocket } from "../../shared/types";
import io from "socket.io-client";
import LoginPage from './login';
import DuringGamePage from './DuringGame';

import { useEffect, useState } from "react";
import { Heading, Box, Button } from "@chakra-ui/react";


export default function Home() {
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [playerID, setPlayerID] = useState<PlayerID | undefined>(undefined);
  const [playerName, setPlayerName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // on first render, connect to the server (just like bareBones.tsx)
  useEffect(() => {
    const socket = io("ws://localhost:8080");
    setSocket(_ => socket); 
    setIsConnected(_ => true);
    return () => {
      socket?.emit('clientDisconnect', playerID)
      socket.disconnect();
    };
  }, []);

  // once socket is set up, send a helloFromClient message
  // and wait(?) for the server to assign an ID
  useEffect(() => {    
    socket?.on("assignID", (playerID: PlayerID) => {
      setPlayerID(playerID);
    });
  }, [socket]);

  // return (
  //   <div>
  //     <Box>
  //       <Heading>Home</Heading>
  //       <Heading>Connected: {isConnected.toString()}</Heading>
  //     </Box>
  //     <LoginPage
  //       setPlayerName={setPlayerName}
  //       socket={socket as ClientSocket}
  //     />
  //     ;
  //   </div>
  // );


  if (!playerName) {
    return <LoginPage setPlayerName={setPlayerName} socket={socket as ClientSocket} />;
  } else {
    return (
      <DuringGamePage
        playerName={playerName}
        playerID={playerID as string} // playerID should be defined at this point.
        socket={socket as ClientSocket}
      />
    );
  }

  
}


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

