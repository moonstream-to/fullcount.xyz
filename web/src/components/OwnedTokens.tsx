import { useQuery, useMutation, useQueryClient } from "react-query";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import styles from "./OwnedTokens.module.css";
import { Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../contexts/Web3Context/context";
import { useContext } from "react";
import { useGameContext } from "../contexts/GameContext";
import useMoonToast from "../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";
import queryCacheProps from "../hooks/hookCommon";
import CharacterCard from "./CharacterCard";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

export interface Token {
  id: number;
  name: string;
  image: string;
}

const OwnedTokens = () => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress } = useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;

  const mintToken = useMutation(
    async ({ name, imageIndex }: { name: string; imageIndex: number }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      return tokenContract.methods.mint(name, imageIndex).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Minting failed." + e?.message, "error");
      },
    },
  );

  function decodeBase64Json(encodedData: string): any {
    try {
      // Split the encoded data to remove the data URI scheme if present
      const base64String = encodedData.split(",")[1] || encodedData;

      // Decode the base64 string to a UTF-8 string
      const decodedStr = Buffer.from(base64String, "base64").toString("utf-8");

      // Parse the JSON string to an object
      return JSON.parse(decodedStr);
    } catch (error) {
      console.error("Failed to decode base64 JSON data:", error);
      return null;
    }
  }

  const ownedTokens = useQuery<Token[]>(
    ["owned_tokens", web3ctx.account, web3ctx.chainId],
    async () => {
      console.log("ownedTokens");

      const balanceOf = await tokenContract.methods.balanceOf(web3ctx.account).call();
      const tokens = [];
      for (let i = 0; i < balanceOf; i++) {
        const tokenId = await tokenContract.methods.tokenOfOwnerByIndex(web3ctx.account, i).call();
        const tokenMetadata = decodeBase64Json(
          await tokenContract.methods.tokenURI(tokenId).call(),
        );
        console.log(tokenMetadata);
        tokens.push({
          id: tokenId,
          name: tokenMetadata.name.split(` - ${tokenId}`)[0],
          image: tokenMetadata.image,
        });
      }
      console.log(tokens);
      return tokens;
    },
    {
      ...queryCacheProps,
    },
  );

  return (
    <Flex className={styles.container}>
      <Text className={styles.title}>Your NFTs</Text>
      <Flex className={styles.cards}>
        {ownedTokens.data &&
          ownedTokens.data.map((token: Token, idx: number) => (
            <CharacterCard token={token} key={idx} />
          ))}
      </Flex>

      <button className={styles.button} onClick={onOpen}>
        {mintToken.isLoading ? <Spinner /> : "Mint"}
      </button>
      <CreateNewCharacter
        isOpen={isOpen}
        onClose={onClose}
        onSave={(name, imageIndex) => {
          onClose();
          mintToken.mutate({ name, imageIndex });
        }}
      />
    </Flex>
  );
};

export default OwnedTokens;
