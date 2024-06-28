import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Button, Box,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Text,
  VStack, Tr, Td, Table, Tbody, TableContainer, HStack
} from '@chakra-ui/react';
import type { ClientSocket } from "../../shared/types";


export default function LoginPage(
  props: { setPlayerName: (playerName: string) => void, socket: ClientSocket }
) {
  const [playerName, setPlayerName] = useState<string>("");

  function handleClick(event: any) {
    event.preventDefault(); // magic, sorry.
    const newplayerName: string = playerName == "" ? "anonymous" : playerName;
    props.socket.emit("helloFromClient", newplayerName);
    props.setPlayerName(newplayerName);
  }

  return (
    <VStack spacing={0} align="center" width={500}>
      <form>
        <FormControl>
          <VStack align="left" spacing={0}>
            <FormLabel as="b">Player Name</FormLabel>
            <HStack w="500" align="left">
              <Input
                name="title"
                value={playerName}
                placeholder="type player name here"
                onChange={(event) => {
                  setPlayerName(event.target.value);
                }}
              />
              <Box>
                <Button
                  bg="lightblue"
                  type="submit"
                  onClick={handleClick}
                  width={100}
                >
                  {" "}
                  Submit
                </Button>
              </Box>
              //{" "}
            </HStack>
          </VStack>
        </FormControl>
      </form>
    </VStack>
  );
}
