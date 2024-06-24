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

export default function YourMoveForm (props: { 
    maxMove:number, 
    onSubmit: (arg0: number) => void }) {
      // the player's move, as a string
      const [move, setMove] = useState<string>("");

      function handleClick(event: any) {
        event.preventDefault(); // magic, sorry.
        props.onSubmit(parseInt(move));
      }

      // is all this JSX necessary?
      return (
        <VStack spacing={0} align="center" width={500}>
          <form>
            <FormControl>
              <VStack align="left" spacing={0}>
                <FormLabel as="b">
                  Make a move between 1 and {props.maxMove}{" "}
                </FormLabel>
                <HStack w="100" align="left">
                  <Input
                    name="title"
                    placeholder="type move here"
                    onChange={(event) => {
                      setMove(event.target.value);
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