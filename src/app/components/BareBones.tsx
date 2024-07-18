"use client"
import * as React from 'react';

import type { ClientSocket } from "../../../shared/types";
import io from "socket.io-client";

import { useEffect, useState } from "react";
import { Heading, Box, Button } from "@chakra-ui/react";


export default function Home() {
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const SERVICEURL = 'NEXT_PUBLIC_NIM_SERVICE';//process.env.NEXT_PUBLIC_NIM_SERVICE;
  // on first render, connect to the server
  useEffect(() => {
    const socket = io("ws://" + SERVICEURL);
    setSocket(preSocket =>socket); 
    setIsConnected(anything => true);
    return () => {
      socket?.emit('clientDisconnect', "playerID")
      socket.disconnect();
    };
  }, []);

  return (
    <Box>
      <Heading>Home</Heading>
      <Heading>Connected: {isConnected.toString()}</Heading>
    </Box>
  );  
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

