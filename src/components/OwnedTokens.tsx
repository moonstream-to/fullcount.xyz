import { useQuery, useMutation, useQueryClient } from "react-query";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import styles from "./OwnedTokens.module.css";
import { Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../contexts/Web3Context/context";
import { useContext } from "react";
import { useGameContext } from "../contexts/GameContext";
import useMoonToast from "../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

const OwnedTokens = () => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress } = useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mintToken = useMutation(
    async ({ name, imageIndex }: { name: string; imageIndex: number }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;

      tokenContract.options.address = tokenAddress;
      return tokenContract.methods.mint(name, imageIndex).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("contract_approval");
      },
      onError: (e: Error) => {
        toast("Minting failed." + e?.message, "error");
      },
    },
  );

  return (
    <Flex className={styles.container}>
      <Text className={styles.title}>Your NFTs</Text>
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
