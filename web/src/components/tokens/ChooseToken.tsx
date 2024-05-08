import styles from "./ChooseToken.module.css";
import parentStyles from "./CreateNewCharacter.module.css";
import { AtBat, OwnedToken, Token } from "../../types";
import TokenCard from "./TokenCard";
import React, { useEffect, useRef, useState } from "react";
import NewCharacterButton from "./NewCharacterButton";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { useRouter } from "next/router";
import { sendReport } from "../../utils/humbug";
import useMoonToast from "../../hooks/useMoonToast";
import useUser from "../../contexts/UserContext";
import { useSound } from "../../hooks/useSound";
import { Spinner } from "@chakra-ui/react";
import PvPIcon from "../icons/PvPIcon";
import { useGameContext } from "../../contexts/GameContext";
import { getContracts } from "../../utils/getWeb3Contracts";

const getErrorMessage = (sessionProgress: number) => {
  switch (sessionProgress) {
    case 0:
      return "At-bat not found";
    case 2:
      return undefined;
    default:
      return "Invitation is no longer valid";
  }
};

const ChooseToken = ({
  tokens,
  onClose,
  sessionID,
  inviteCode,
  inviteFrom,
}: {
  tokens: OwnedToken[];
  onClose: () => void;
  sessionID: number;
  inviteCode: string;
  inviteFrom: string;
}) => {
  const { updateContext, selectedTokenIdx } = useGameContext();

  const elementRef = useRef<HTMLDivElement>(null);
  const [drawBottomLine, setDrawBottomLine] = useState(false);
  const toast = useMoonToast();
  const { user } = useUser();
  const playSound = useSound();
  const { isCreateCharacter } = useGameContext();
  const router = useRouter();

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setDrawBottomLine(element.scrollHeight > element.clientHeight);
    }
  }, [tokens]);

  const handleClick = () => {
    playSound("batButton");
    joinSession.mutate({ sessionID, token: tokens[selectedTokenIdx], inviteCode });
  };

  const handleExitClick = () => {
    router.push("/");
    sendReport("Invite is invalid", { sessionID }, ["type:click", "click:close_invite"]);
  };

  const sessionProgress = useQuery(["session_status", sessionID], () => {
    const { gameContract } = getContracts();
    return gameContract.methods.sessionProgress(sessionID).call();
  });

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
        sendReport("Error toast", { error: e }, ["type:error_toast"]);
      },
    },
  );

  return (
    <>
      {!isCreateCharacter && (
        <div className={styles.background}>
          <div className={styles.container}>
            <div className={styles.headerContainer}>
              <PvPIcon fill={"#262019"} />
              <div className={styles.header}>BATTER UP</div>
            </div>
            {sessionProgress.data && getErrorMessage(Number(sessionProgress.data)) ? (
              <>
                <div className={styles.prompt}>
                  {`${inviteFrom} is inviting you to play Fullcount.xyz.`} <br />
                </div>
                <div className={styles.error}>{getErrorMessage(Number(sessionProgress.data))}</div>
                <div className={parentStyles.buttonsContainer}>
                  <button type={"button"} className={parentStyles.button} onClick={handleExitClick}>
                    Go to home page
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.prompt}>
                  {`${inviteFrom} is inviting you to play Fullcount.xyz.`} <br />
                  {`Choose a character to play with.`}
                </div>
                <div
                  className={styles.content}
                  style={{ borderBottom: drawBottomLine ? "1px solid #7e8e7f" : "none" }}
                >
                  <div className={styles.cards} ref={elementRef}>
                    {tokens.map((t, idx) => (
                      <TokenCard
                        key={idx}
                        token={t}
                        isSelected={idx === selectedTokenIdx}
                        onSelected={() =>
                          updateContext({
                            selectedToken: { ...tokens[idx] },
                            selectedTokenIdx: idx,
                          })
                        }
                      />
                    ))}
                    <NewCharacterButton small={false} />
                  </div>
                </div>
                <div className={parentStyles.buttonsContainer}>
                  <button type={"button"} className={parentStyles.cancelButton} onClick={onClose}>
                    Cancel
                  </button>
                  <button type={"button"} className={parentStyles.button} onClick={handleClick}>
                    {joinSession.isLoading ? <Spinner /> : "Play"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChooseToken;
