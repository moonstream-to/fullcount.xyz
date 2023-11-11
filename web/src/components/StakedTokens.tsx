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

const StakedTokens = () => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress, contractAddress, selectedToken, updateContext, sessions } =
    useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;

  return (
    <>
      <Flex className={styles.cards} alignItems={"end"}>
        {sessions &&
          sessions
            .map((session) =>
              [session.pair.pitcher, session.pair.batter].filter(
                (token): token is Token => !!token,
              ),
            )
            .flat()
            .filter((token) => token?.staker === web3ctx.account)
            .map((token: Token, idx: number) => (
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
      </Flex>
    </>
  );
};

export default StakedTokens;
