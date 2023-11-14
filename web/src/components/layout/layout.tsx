import Head from "next/head";

import { Flex } from "@chakra-ui/react";

import { AWS_STATIC_ASSETS_PATH } from "../../constants";

const assetsPath = `${AWS_STATIC_ASSETS_PATH}/moonbound`;

export const siteTitle = "Moonstream apps portal";

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
        <link rel="icon" href="/favicon.png" />
        <title>{title ?? "Moonbound"}</title>
        <meta
          name="description"
          content="Survive initiation into the Cult of the Moon. A Moonstream and Champions Ascension collaboration."
        />
        <meta name="og:title" content={siteTitle} />
        <meta
          name="keywords"
          content="NFT gaming, smart contracts, web3, smart contract, ethereum, polygon, matic, transactions, defi, decentralized, mempool, NFT, NFTs, DAO, DAOs, cryptocurrency, cryptocurrencies, bitcoin, blockchain economy, blockchain game, marketplace, blockchain security, loyalty program, Ethereum bridge, Ethereum bridges, NFT game, NFT games"
        />
        <meta name="og:image" content={`${assetsPath}/background-small.png`} />
      </Head>
      <Flex minH="100vh" fontFamily="Lora, serif" direction={"column"}>
        {children}
      </Flex>
    </div>
  );
}
