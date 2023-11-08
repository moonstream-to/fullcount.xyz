import type { AppProps } from "next/app";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "../src/theme";
import { Web3Context } from "../src/contexts";
import "../src/styles/globals.css";
import { GameContextProvider } from "../src/contexts/GameContext";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(new QueryClient());

  return (
    <>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Web3Context>
            <GameContextProvider>
              <Component {...pageProps} />
            </GameContextProvider>
          </Web3Context>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}
