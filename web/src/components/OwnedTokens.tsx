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
import { decodeBase64Json } from "../utils/decoders";
import { Token } from "../types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

const OwnedTokens = () => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress, contractAddress, selectedToken, updateContext } = useGameContext();
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
      if (!selectedToken && tokens.length > 0) {
        const randomIndex = Math.floor(Math.random() * tokens.length);
        updateContext({ selectedToken: tokens[randomIndex] });
      }
      return tokens;
    },
    {
      ...queryCacheProps,
    },
  );

  const isApproved = useQuery<boolean>(
    ["isApproved", web3ctx.account, web3ctx.chainId, contractAddress],
    async () => {
      console.log("isApproved");

      const isApproved = await tokenContract.methods
        .isApprovedForAll(web3ctx.account, contractAddress)
        .call();
      console.log(isApproved);
      return isApproved;
    },
    {
      ...queryCacheProps,
    },
  );

  const setApproval = useMutation(
    async ({ approval }: { approval: boolean }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return tokenContract.methods.setApprovalForAll(contractAddress, approval).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("isApproved");
        toast("SetApproval successful.", "success");
      },
      onError: (e: Error) => {
        toast("SetApproval failed." + e?.message, "error");
      },
    },
  );

  return (
    <>
      <Flex className={styles.cards} alignItems={"end"}>
        {isApproved.isSuccess && isApproved.data === false && (
          <button className={styles.button} onClick={() => setApproval.mutate({ approval: true })}>
            {mintToken.isLoading ? <Spinner /> : "Approve"}
          </button>
        )}
        {ownedTokens.data &&
          ownedTokens.data.map((token: Token, idx: number) => (
            <CharacterCard
              token={token}
              key={idx}
              isActive={false}
              maxW={"70px"}
              maxH={"85px"}
              isClickable={true}
              border={selectedToken?.id === token.id ? "1px solid white" : "1px solid #4D4D4D"}
              showName={false}
            />
          ))}
        <Flex w={"70px"} h={"85px"} className={styles.mintCard} onClick={onOpen} cursor={"pointer"}>
          {mintToken.isLoading ? <Spinner /> : " + Mint"}
        </Flex>
      </Flex>

      <CreateNewCharacter
        isOpen={isOpen}
        onClose={onClose}
        onSave={(name, imageIndex) => {
          onClose();
          mintToken.mutate({ name, imageIndex });
        }}
      />
    </>
  );
};

export default OwnedTokens;
