import type { AppProps } from "next/app";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "../src/theme";
import { Web3Context } from "../src/contexts";
import "../src/styles/globals.css";
import { GameContextProvider } from "../src/contexts/GameContext";
import { UserProvider } from "../src/contexts/UserContext";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(new QueryClient());

  return (
    <>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Web3Context>
            <UserProvider>
              <GameContextProvider>
                <Component {...pageProps} />
              </GameContextProvider>
            </UserProvider>
          </Web3Context>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}
