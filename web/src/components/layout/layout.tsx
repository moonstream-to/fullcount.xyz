import Head from "next/head";

import { Flex } from "@chakra-ui/react";

import { FULLCOUNT_ASSETS_PATH } from "../../constants";

const assetsPath = FULLCOUNT_ASSETS_PATH;

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
        <meta name="description" content="Baseball game" />
        <meta name="og:title" content={siteTitle} />
        <meta
          name="keywords"
          content="NFT gaming, smart contracts, web3, smart contract, ethereum, polygon, matic, transactions, defi, decentralized, mempool, NFT, NFTs, DAO, DAOs, cryptocurrency, cryptocurrencies, bitcoin, blockchain economy, blockchain game, marketplace, blockchain security, loyalty program, Ethereum bridge, Ethereum bridges, NFT game, NFT games"
        />
        <meta name="og:image" content={`${assetsPath}/fullcount-og-image.png`} />
      </Head>
      <Flex
        minH="100vh"
        bg="#1B1B1B"
        alignItems={"center"}
        fontFamily="Pangolin, cursive"
        direction={"column"}
      >
        {children}
      </Flex>
    </div>
  );
}
