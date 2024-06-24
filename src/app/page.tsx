"use client"
import * as React from 'react';
import { ChakraProvider, VStack } from '@chakra-ui/react';

// import App from './components/nimApp'
import App from './components/bareBones'

export default function Home() {
  return (
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
}
