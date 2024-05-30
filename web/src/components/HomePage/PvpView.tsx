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
import {
  fetchOpenTrustedExecutorAtBats,
  joinAtBatTrustedExecutor,
} from "../../tokenInterfaces/TrustedExecutorAPI";
import React, { useState } from "react";
import SelectTokenView from "../tokens/SelectTokenView";
const views = ["Open", "My games", "Other"];

const PvpView = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
  const { selectedToken, tokensCache, updateContext, selectedPVPView, atBatToPlay } =
    useGameContext();
  const [playRole, setPlayRole] = useState(0);
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
      atBatID,
      token,
      inviteCode,
    }: {
      atBatID: string;
      token: OwnedToken;
      inviteCode: string;
    }): Promise<unknown> => {
      console.log(atBatID, token);
      return joinAtBatTrustedExecutor({ token, atBatID });
    },
    {
      onSuccess: async (data, variables) => {
        queryClient.refetchQueries("owned_tokens");
        router.push(`atbats/?id=${variables.atBatID}`);
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
    if (selectedToken && atBat.id) {
      if (!selectedToken.isStaked) {
        joinSession.mutate({
          atBatID: String(atBat.id),
          token: selectedToken,
          inviteCode: "",
        });
      } else {
        setPlayRole(atBat.pitcher ? 1 : 0);
        updateContext({ atBatToPlay: { ...atBat } });
      }
    }
  };

  return (
    <div className={styles.container}>
      {atBatToPlay && (
        <SelectTokenView
          playRole={playRole}
          tokens={tokens}
          onClose={(isSuccess: boolean) => {
            if (isSuccess && atBatToPlay) {
              handlePlay({ ...atBatToPlay });
            }
            updateContext({ atBatToPlay: undefined });
          }}
        />
      )}
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
                      joinSession.variables?.atBatID === openAtBat.id && joinSession.isLoading
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
                      joinSession.variables?.atBatID === openAtBat.id && joinSession.isLoading
                    }
                    key={idx}
                  />
                ) : (
                  <div key={idx} style={{ width: "130px", height: "225.5px" }} />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvpView;
