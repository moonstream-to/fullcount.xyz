import type { AppProps } from "next/app";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "../src/theme";
import { Web3Context } from "../src/contexts";
import "../src/styles/globals.css";
import { GameContextProvider } from "../src/contexts/GameContext";
import { UserProvider } from "../src/contexts/UserContext";
import Script from "next/script";
import ErrorBoundary from "../src/components/layout/ErrorBoundary";
import { GA_MEASUREMENT_ID, GTM_ID } from "../src/constants";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(new QueryClient());

  return (
    <ErrorBoundary>
      <>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer',${GTM_ID});`,
          }}
        />
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
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
    </ErrorBoundary>
  );
}
