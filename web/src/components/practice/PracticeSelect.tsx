import styles from "./PracticeView.module.css";
import parentStyles from "../HomePage/PvpView.module.css";
import { useState } from "react";
import { AtBat, OwnedToken, Token } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useMutation, useQueryClient } from "react-query";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import router from "next/router";
import useUser from "../../contexts/UserContext";
import { Image, Spinner } from "@chakra-ui/react";
import useMoonToast from "../../hooks/useMoonToast";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import ExitIcon from "../icons/ExitIcon";
import TokenCardSmall from "../atbat/TokenCardSmall";

const levels = ["Easy", "Medium", "Hard"];

const PracticeSelect = () => {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const { atBatsForPractice, selectedToken } = useGameContext();

  const getSelectedToken = (atBat: AtBat | undefined) => {
    if (atBat?.pitcher) return { token: atBat.pitcher, isPitcher: true };
    if (atBat?.batter) return { token: atBat.batter, isPitcher: false };
    return { token: undefined, isPitcher: false };
  };

  const queryClient = useQueryClient();
  const { user } = useUser();
  const toast = useMoonToast();
  const joinSession = useMutation(
    async ({
      sessionID,
      token,
      inviteCode,
    }: {
      sessionID: number;
      token: OwnedToken;
      inviteCode: string;
    }): Promise<unknown> => {
      return joinSessionFullcountPlayer({ token, sessionID, inviteCode });
    },
    {
      onSuccess: async (data, variables) => {
        let atBatId: number | undefined = undefined;
        queryClient.setQueryData(
          ["atBats"],
          (oldData: { atBats: AtBat[]; tokens: Token[] } | undefined) => {
            console.log(oldData);
            if (!oldData) {
              return { atBats: [], tokens: [] };
            }
            const newAtBats = oldData.atBats.map((atBat) => {
              if (atBat.lastSessionId !== variables.sessionID) {
                return atBat;
              }
              atBatId = atBat.id;
              if (!atBat.pitcher) {
                return { ...atBat, progress: 3, pitcher: { ...variables.token } };
              }
              if (!atBat.batter) {
                return { ...atBat, progress: 3, batter: { ...variables.token } };
              }
              return atBat;
            });

            return { atBats: newAtBats, tokens: oldData.tokens };
          },
        );
        queryClient.setQueryData(["owned_tokens", user], (oldData: OwnedToken[] | undefined) => {
          console.log(oldData);
          if (!oldData) {
            return [];
          }
          return oldData.map((t) => {
            if (t.address === variables.token.address && t.id === variables.token.id) {
              return {
                ...t,
                isStaked: true,
                stakedSessionID: variables.sessionID,
                tokenProgress: 3,
              };
            }
            return t;
          });
        });
        queryClient.invalidateQueries("owned_tokens");
        if (atBatId) {
          router.push(`atbats/?id=${atBatId}`);
        }
      },
      retryDelay: (attemptIndex) => (attemptIndex < 1 ? 5000 : 10000),
      retry: (failureCount, error) => {
        console.log(error);
        if (failureCount < 3) {
          console.log("Will retry in 5, maybe 10 seconds");
        }
        return failureCount < 3;
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const handlePlay = (atBat: AtBat | undefined) => {
    if (selectedToken && atBat) {
      joinSession.mutate({
        sessionID: atBat.lastSessionId ?? 0,
        token: selectedToken,
        inviteCode: "",
      });
    }
  };

  if (!atBatsForPractice) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.exitButton} onClick={() => router.push("/")}>
        <ExitIcon onClick={() => router.push("/")} />
      </div>
      <Image
        minW={"552px"}
        h={"123px"}
        position={"absolute"}
        src={`${FULLCOUNT_ASSETS_PATH}/stadium.png`}
        right={"50%"}
        bottom={"50%"}
        transform={"translateX(50%) translateY(50%)"}
      />
      {getSelectedToken(atBatsForPractice[selectedLevel]).token && (
        <TokenCardSmall
          token={getSelectedToken(atBatsForPractice[selectedLevel]).token}
          isPitcher={getSelectedToken(atBatsForPractice[selectedLevel]).isPitcher}
          showId={false}
        />
      )}
      <div className={parentStyles.viewSelector}>
        {levels.slice(0, atBatsForPractice.length).map((v, idx) => (
          <div
            className={selectedLevel === idx ? styles.buttonSelected : styles.button}
            onClick={() => setSelectedLevel(idx)}
            key={idx}
          >
            {v}
          </div>
        ))}
      </div>
      <div
        className={styles.actionButton}
        onClick={() => handlePlay(atBatsForPractice[selectedLevel])}
      >
        {joinSession.isLoading ? (
          <Spinner h={4} w={4} />
        ) : joinSession.isSuccess ? (
          "Success"
        ) : (
          "Train"
        )}
      </div>
    </div>
  );
};

export default PracticeSelect;
