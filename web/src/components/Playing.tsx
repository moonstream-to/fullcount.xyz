import { Flex } from "@chakra-ui/react";

import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./sessions/SessionsView";
import PlayView from "./playing/PlayView";
import styles from "./Playing.module.css";
import { useQuery } from "react-query";
import { OwnedToken } from "../types";
import { fetchOwnedBLBTokens } from "../tokenInterfaces/BLBTokenAPI";
import { fetchFullcountPlayerTokens } from "../tokenInterfaces/FullcountPlayerAPI";
import queryCacheProps from "../hooks/hookCommon";
import useUser from "../contexts/UserContext";
import CreateCharacterForm from "./tokens/CreateCharacterForm";

const Playing = () => {
  const { selectedSession, selectedToken, watchingToken, updateContext } = useGameContext();
  const { user } = useUser();

  const ownedTokens = useQuery<OwnedToken[]>(
    ["owned_tokens", user],
    async () => {
      console.log("FETCHING TOKENS");
      const ownedTokens = user ? await fetchFullcountPlayerTokens() : [];
      updateContext({ ownedTokens: [...ownedTokens] });
      return ownedTokens;
    },
    {
      ...queryCacheProps,
      refetchInterval: 15000,
    },
  );

  return (
    // <Flex className={styles.container}>
    <>
      {ownedTokens.data && ownedTokens.data.length < 5 && <CreateCharacterForm />}
      {!selectedSession && ownedTokens.data && ownedTokens.data.length > 4 && (
        <SessionsView ownedTokens={ownedTokens.data} />
      )}
      {selectedSession && watchingToken && <PlayView selectedToken={watchingToken} />}
      {selectedSession && !watchingToken && selectedToken && (
        <PlayView selectedToken={selectedToken} />
      )}
    </>
    // </Flex>
  );
};

export default Playing;
