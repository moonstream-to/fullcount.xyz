import router from "next/router";
import { useMutation, useQuery, useQueryClient } from "react-query";

import styles from "./PvpView.module.css";
import { AtBat, OpenAtBat, OwnedToken, Token } from "../../types";
import { ZERO_ADDRESS } from "../../constants";
import TokenToPlay from "./TokenToPlay";
import AtBatsList from "./AtBatsList";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import useUser from "../../contexts/UserContext";
import { isCampaignToken } from "../campaign/teams";
import { isCoach } from "./PracticeView";
import { sendReport } from "../../utils/humbug";
import { useSound } from "../../hooks/useSound";
import { fetchOpenTrustedExecutorAtBats } from "../../tokenInterfaces/TrustedExecutorAPI";
const views = ["Open", "My games", "Other"];

const PvpView = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
  const { selectedToken, tokensCache, updateContext, selectedPVPView } = useGameContext();
  const toast = useMoonToast();
  const { user } = useUser();
  const playSound = useSound();

  const openAtBats = useQuery(
    ["openAtBats"],
    () => {
      return fetchOpenTrustedExecutorAtBats(tokensCache);
    },
    {
      onSuccess: (data) => {
        console.log(data);
        if (data.tokens) {
          updateContext({ tokensCache: tokens });
        }
      },
      refetchInterval: 5000,
    },
  );

  const queryClient = useQueryClient();
  const joinSession = useMutation(
    async ({
      sessionID,
      token,
      inviteCode,
      atBatID,
    }: {
      sessionID: number;
      token: OwnedToken;
      inviteCode: string;
      atBatID?: string;
    }): Promise<unknown> => {
      return joinSessionFullcountPlayer({ token, sessionID, inviteCode });
    },
    {
      onSuccess: async (data, variables) => {
        const atBatID: string | undefined = variables.atBatID;
        // queryClient.setQueryData(
        //   ["atBats"],
        //   (oldData: { atBats: AtBat[]; tokens: Token[] } | undefined) => {
        //     if (!oldData) {
        //       return { atBats: [], tokens: [] };
        //     }
        //     const newAtBats = oldData.atBats.map((atBat) => {
        //       if (atBat.lastSessionId !== variables.sessionID) {
        //         return atBat;
        //       }
        //       atBatId = atBat.id;
        //       if (!atBat.pitcher) {
        //         return { ...atBat, progress: 3, pitcher: { ...variables.token } };
        //       }
        //       if (!atBat.batter) {
        //         return { ...atBat, progress: 3, batter: { ...variables.token } };
        //       }
        //       return atBat;
        //     });
        //
        //     return { atBats: newAtBats, tokens: oldData.tokens };
        //   },
        // );
        queryClient.setQueryData(["owned_tokens", user], (oldData: OwnedToken[] | undefined) => {
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
        if (atBatID) {
          router.push(`atbats/?id=${atBatID}`);
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
        sendReport("Error toast", { error: e }, ["type:error_toast"]);
      },
    },
  );
  const handlePlay = (atBat: AtBat) => {
    if (selectedToken) {
      joinSession.mutate({
        sessionID: atBat.lastSessionId ?? 0,
        token: selectedToken,
        inviteCode: "",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.viewSelector}>
        {views.map((v, idx) => (
          <div
            className={selectedPVPView === idx ? styles.buttonSelected : styles.button}
            onClick={() => {
              playSound("viewSelector");
              updateContext({ selectedPVPView: idx });
            }}
            key={idx}
          >
            {v}
          </div>
        ))}
      </div>
      {selectedPVPView === 2 && atBats && (
        <AtBatsList
          tokens={tokens}
          atBats={atBats.filter(
            (a) =>
              a.progress !== 6 &&
              a.progress !== 2 &&
              !tokens.some(
                (t) =>
                  (t.address === a.pitcher?.address && t.id === a.pitcher.id) ||
                  (t.address === a.batter?.address && t.id === a.batter.id),
              ),
          )}
        />
      )}
      {selectedPVPView === 1 && atBats && (
        <AtBatsList
          tokens={tokens}
          atBats={atBats.filter(
            (a) =>
              a.progress !== 6 &&
              tokens.some(
                (t) =>
                  (t.address === a.pitcher?.address && t.id === a.pitcher.id) ||
                  (t.address === a.batter?.address && t.id === a.batter.id),
              ),
          )}
        />
      )}
      {atBats && selectedPVPView === 0 && (
        <div className={styles.listsContainer}>
          <div className={styles.list}>
            <div className={styles.listHeader}>PITCHERS</div>
            {openAtBats.data &&
              openAtBats.data.atBats &&
              openAtBats.data.atBats.map((openAtBat, idx) => {
                return openAtBat.pitcher ? (
                  <TokenToPlay
                    requiresSignature={openAtBat.requiresSignature}
                    token={openAtBat.pitcher}
                    isPitcher={true}
                    onClick={() => {
                      playSound("batButton");
                      handlePlay(openAtBat);
                    }}
                    isLoading={
                      joinSession.variables?.sessionID === openAtBat.lastSessionId &&
                      joinSession.isLoading
                    }
                    key={idx}
                  />
                ) : (
                  <div key={idx} style={{ width: "130px", height: "225.5px" }} />
                );
              })}
          </div>
          <div className={styles.list}>
            <div className={styles.listHeader}>batters</div>
            {openAtBats.data &&
              openAtBats.data.atBats &&
              openAtBats.data.atBats.map((openAtBat, idx) => {
                return openAtBat.batter ? (
                  <TokenToPlay
                    requiresSignature={openAtBat.requiresSignature}
                    token={openAtBat.batter}
                    isPitcher={false}
                    onClick={() => {
                      playSound("pitchButton");
                      handlePlay(openAtBat);
                    }}
                    isLoading={
                      joinSession.variables?.sessionID === openAtBat.lastSessionId &&
                      joinSession.isLoading
                    }
                    key={idx}
                  />
                ) : (
                  <div style={{ width: "130px", height: "225.5px" }} />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvpView;
