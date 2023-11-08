import { useGameContext } from "../contexts/GameContext";
import { Flex, Text } from "@chakra-ui/react";
import styles from "./SessionsView.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";
import useMoonToast from "../hooks/useMoonToast";
import queryCacheProps from "../hooks/hookCommon";
import { Token } from "./OwnedTokens";
import { decodeBase64Json } from "../utils/decoders";
import CharacterCard from "./CharacterCard";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SessionsView = () => {
  const { selectedToken, updateContext, tokenAddress, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;
  const queryClient = useQueryClient();
  const toast = useMoonToast();

  const startSession = useMutation(
    async (role: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      console.log(tokenAddress, selectedToken, role);
      return gameContract.methods.startSession(tokenAddress, selectedToken, role).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sessions");
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Start failed" + e?.message, "error");
      },
    },
  );

  const joinSession = useMutation(
    async (sessionID: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      console.log(sessionID, tokenAddress, selectedToken);
      return gameContract.methods.joinSession(sessionID, tokenAddress, selectedToken).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sessions");
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const sessions = useQuery<any[]>(
    ["sessions", web3ctx.account, web3ctx.chainId],
    async () => {
      console.log("sessions");

      const numSessions = await gameContract.methods.NumSessions().call();
      console.log(numSessions);
      const sessions = [];
      for (let i = 1; i <= numSessions; i += 1) {
        const session = await gameContract.methods.getSession(i).call();
        const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
          pitcher: undefined,
          batter: undefined,
        };
        if (session.pitcherAddress !== ZERO_ADDRESS) {
          const pitcherMetadata = decodeBase64Json(
            await tokenContract.methods.tokenURI(session.pitcherTokenID).call(),
          );
          pair.pitcher = {
            id: session.pitcherTokenID,
            name: pitcherMetadata.name.split(` - `)[0],
            image: pitcherMetadata.image,
          };
        }
        if (session.batterAddress !== ZERO_ADDRESS) {
          const batterMetadata = decodeBase64Json(
            await tokenContract.methods.tokenURI(session.batterTokenID).call(),
          );
          pair.batter = {
            id: session.pitcherTokenID,
            name: batterMetadata.name.split(` - `)[0],
            image: batterMetadata.image,
          };
        }

        sessions.push({ pair, sessionID: i });
        console.log({ pair, sessionID: i });
      }
      console.log(sessions);
      return sessions;
    },
    {
      ...queryCacheProps,
    },
  );

  return (
    <Flex className={styles.container}>
      <Flex
        justifyContent={"space-between"}
        className={styles.session}
        w={"100%"}
        placeSelf={"stretch"}
        minW={"100%"}
      >
        <Text className={styles.title}>Sessions</Text>
        <Flex gap={"20px"}>
          <button className={globalStyles.button} onClick={() => startSession.mutate(0)}>
            Start new session as pitcher
          </button>
          <button className={globalStyles.button} onClick={() => startSession.mutate(1)}>
            Start new session as batter
          </button>
        </Flex>
      </Flex>
      {sessions.data &&
        sessions.data.map((session, index: number) => (
          <Flex justifyContent={"space-between"} key={index} w={"100%"} alignItems={"center"}>
            {session.pair.pitcher ? (
              <CharacterCard token={session.pair.pitcher} active={false} />
            ) : (
              <button
                className={globalStyles.button}
                onClick={() => joinSession.mutate(session.sessionID)}
              >
                join as pitcher
              </button>
            )}
            <Text>vs</Text>
            {session.pair.batter ? (
              <CharacterCard token={session.pair.batter} active={false} />
            ) : (
              <button
                className={globalStyles.button}
                onClick={() => joinSession.mutate(session.sessionId)}
              >
                join as batter
              </button>
            )}
          </Flex>
        ))}
    </Flex>
  );
};

export default SessionsView;
