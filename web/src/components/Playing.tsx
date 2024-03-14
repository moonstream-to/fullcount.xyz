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
import PlayingLayout from "./layout/PlayingLayout";
import ChooseToken from "./tokens/ChooseToken";
import HomePage from "./HomePage/HomePage";
import { getAtBats } from "../services/fullcounts";

const Playing = () => {
  const {
    selectedSession,
    selectedToken,
    watchingToken,
    updateContext,
    invitedTo,
    isCreateCharacter,
    tokensCache,
  } = useGameContext();
  const { user } = useUser();

  const ownedTokens = useQuery<OwnedToken[]>(
    ["owned_tokens", user],
    async () => {
      console.log("FETCHING TOKENS");
      const ownedTokens = user ? await fetchFullcountPlayerTokens() : [];
      // updateContext({ ownedTokens: [...ownedTokens.slice(0, 3)] }); //check if something changed
      return ownedTokens.slice(0, 3); //TODO TURN  THIS OFFFFF!!!
    },
    {
      ...queryCacheProps,
      refetchInterval: 15000,
    },
  );

  const atBats = useQuery(
    ["atBats"],
    async () => {
      return getAtBats({ tokensCache });
    },
    {
      refetchInterval: 5000,
      onSuccess: (data: any) => {
        console.log(data);
        if (data.tokens.length !== tokensCache.length) {
          updateContext({ tokensCache: [...data.tokens] });
        }
      },
    },
  );

  return (
    <>
      {isCreateCharacter && (
        <CreateCharacterForm onClose={() => updateContext({ isCreateCharacter: false })} />
      )}

      {ownedTokens.data && ownedTokens.data.length < 1 && <CreateCharacterForm />}

      {!selectedSession &&
        ownedTokens.data &&
        ownedTokens.data.length >= 1 &&
        !invitedTo &&
        !isCreateCharacter && (
          <PlayingLayout>
            <HomePage tokens={ownedTokens.data} atBats={atBats.data?.atBats} />
          </PlayingLayout>
        )}

      {invitedTo && ownedTokens.data && !isCreateCharacter && (
        <ChooseToken
          tokens={ownedTokens.data}
          onChoose={(token) => {
            updateContext({ selectedToken: token, invitedTo: undefined });
          }}
          onClose={() => updateContext({ invitedTo: undefined })}
        />
      )}

      {selectedSession && watchingToken && <PlayView selectedToken={watchingToken} />}
      {selectedSession && !watchingToken && selectedToken && (
        <PlayView selectedToken={selectedToken} />
      )}
    </>
  );
};

export default Playing;
