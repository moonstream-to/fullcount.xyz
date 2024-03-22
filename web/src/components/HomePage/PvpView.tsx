import router from "next/router";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import styles from "./PvpView.module.css";
import { AtBat, OwnedToken, Token } from "../../types";
import { ZERO_ADDRESS } from "../../constants";
import TokenToPlay from "./TokenToPlay";
import AtBatsList from "./AtBatsList";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { useGameContext } from "../../contexts/GameContext";
import useMoonToast from "../../hooks/useMoonToast";
import useUser from "../../contexts/UserContext";
import { isCampaignToken } from "../campaign/teams";
const views = ["Open", "My games", "Other"];

const PvpView = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
  const { selectedToken } = useGameContext();
  const toast = useMoonToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
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
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
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

  const [selectedView, setSelectedView] = useState(0);
  return (
    <div className={styles.container}>
      <div className={styles.viewSelector}>
        {views.map((v, idx) => (
          <div
            className={selectedView === idx ? styles.buttonSelected : styles.button}
            onClick={() => setSelectedView(idx)}
            key={idx}
          >
            {v}
          </div>
        ))}
      </div>
      {selectedView === 2 && atBats && (
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
      {selectedView === 1 && atBats && (
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
      {atBats && selectedView === 0 && (
        <div className={styles.listsContainer}>
          <div className={styles.list}>
            <div className={styles.listHeader}>PITCHERS</div>
            {atBats
              .filter(
                (a) =>
                  a.progress === 2 &&
                  a.pitcher &&
                  a.pitcher?.address !== ZERO_ADDRESS &&
                  !isCampaignToken(a.pitcher.address, a.pitcher.id),
              )
              .map((openAtBat, idx) => {
                return openAtBat.pitcher ? (
                  <TokenToPlay
                    token={openAtBat.pitcher}
                    isPitcher={true}
                    onClick={() => handlePlay(openAtBat)}
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
          <div className={styles.list}>
            <div className={styles.listHeader}>batters</div>
            {atBats
              .filter(
                (a) =>
                  a.progress === 2 &&
                  a.batter &&
                  a.batter?.address !== ZERO_ADDRESS &&
                  !isCampaignToken(a.batter.address, a.batter.id),
              )
              .map((openAtBat, idx) => {
                return openAtBat.batter ? (
                  <TokenToPlay
                    token={openAtBat.batter}
                    isPitcher={false}
                    onClick={() => handlePlay(openAtBat)}
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
