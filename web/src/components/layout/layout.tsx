import Head from "next/head";

import { Flex } from "@chakra-ui/react";

import { FULLCOUNT_ASSETS, FULLCOUNT_ASSETS_PATH } from "../../constants";
import React from "react";

export const siteTitle = "Fullcount - baseball game";

export default function Layout({
  children,
  title,
}: {
  children: React.ReactNode;
  home?: boolean;
  title?: string;
  needAuthorization?: boolean;
  showBreadcrumb?: boolean;
}) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.png?v1" />
        <title>{title ?? "Fullcount"}</title>
        <meta name="og:title" content={"Fullcount"} />
        <meta name="description" content="A baseball strategy game" />
        <meta name="keywords" content="baseball, strategy, games, fullcount, home run" />
        <meta
          name="og:image"
          content={`${FULLCOUNT_ASSETS}/banners/website-sharing-thumbnail-2.png`}
        />
      </Head>
      <Flex
        minH="100vh"
        bg="#FCECD9"
        alignItems={"center"}
        fontFamily="Pangolin, cursive"
        direction={"column"}
      >
        <audio
          id="joinedNotification"
          src={`${FULLCOUNT_ASSETS_PATH}/sounds/clapping-male-crowd.wav`}
          preload={"auto"}
        />
        {children}
      </Flex>
    </div>
  );
}
