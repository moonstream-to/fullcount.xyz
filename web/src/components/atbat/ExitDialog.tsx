import styles from "./ExitDialog.module.css";
import { AtBat, OwnedToken, Token } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import { abortFullcountPlayerSession } from "../../tokenInterfaces/FullcountPlayerAPI";
import { Spinner, useToast } from "@chakra-ui/react";
import router from "next/router";
import { CANT_ABORT_SESSION_MSG } from "../../messages";
import useMoonToast from "../../hooks/useMoonToast";
import { useEffect, useRef } from "react";
import useUser from "../../contexts/UserContext";
import { useSound } from "../../hooks/useSound";
import { PLAYER_INTERFACE } from "../../constants";
import { abortAtBatTrustedExecutor } from "../../tokenInterfaces/TrustedExecutorAPI";

const ExitDialog = ({
  token,
  sessionId,
  onClose,
  atBatID,
}: {
  token: Token;
  sessionId: number;
  onClose: () => void;
  atBatID: string | null;
}) => {
  const toast = useMoonToast();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const playSound = useSound();

  const updateTokenInCache = (token: Token, sessionId: number) => {
    const currentTokens = queryClient.getQueryData<OwnedToken[]>(["owned_tokens", user]);
    const currentAtBats = queryClient.getQueryData<{ tokens: Token[]; atBats: AtBat[] }>([
      "atBats",
    ]);
    if (currentTokens) {
      const updatedTokens = currentTokens.map((t) => {
        if (t.id === token.id) {
          return {
            ...t,
            isStaked: false,
            tokenProgress: 0,
            stakedSession: 0,
          };
        }
        return t;
      });
      queryClient.setQueryData(["owned_tokens", user], updatedTokens);
    }
    if (currentAtBats) {
      const updatedAtBats = currentAtBats.atBats.map((a) => {
        if (a.lastSessionId === sessionId) {
          return {
            ...a,
            progress: 1,
            tokenProgress: 0,
            stakedSession: 0,
          };
        }
        return a;
      });
      queryClient.setQueryData(["atBats"], updatedAtBats);
    }
  };

  const closeAtBat = useMutation(
    ({
      token,
      sessionId,
      atBatID,
    }: {
      token: Token;
      sessionId?: number;
      atBatID?: string | null;
    }) => {
      if (PLAYER_INTERFACE === "TRUSTED_EXECUTOR" && atBatID) {
        return abortAtBatTrustedExecutor({ token, atBatID });
      }
      if (PLAYER_INTERFACE === "FULLCOUNT_PLAYER" && sessionId) {
        return abortFullcountPlayerSession({ token, sessionId });
      }
      throw new Error("Unexpected error");
    },
    {
      retry: (failureCount, error) => {
        return (
          error instanceof Error && error.message === CANT_ABORT_SESSION_MSG && failureCount < 3
        );
      },
      retryDelay: () => {
        return 3000;
      },
      onError: (error: Error) => {
        toast(`Can't close At-Bat - ${error.message}`, "error");
      },
      onSuccess: (_, variables) => {
        // updateTokenInCache(variables.token, variables.sessionId); //TODO update
        router.push("/");
      },
    },
  );
  const dialogRef = useRef<HTMLDivElement>(null); // Ref for the menu element, typed as HTMLDivElement

  const handleClickOutside = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      onClose();
      event.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleCloseClick = () => {
    playSound("homeButton");
    closeAtBat.mutate({ token, sessionId, atBatID });
  };
  const handleKeepClick = () => {
    playSound("homeButton");
    router.push("/");
  };
  return (
    <div className={styles.container} ref={dialogRef}>
      <div className={styles.prompt}>Do you want to end At-Bat?</div>
      <div className={styles.explanation}>
        You are returning to the home page. You can keep the At-Bat open though.
      </div>
      <div className={styles.buttons}>
        <button
          disabled={closeAtBat.isLoading}
          type={"button"}
          className={styles.leftButton}
          onClick={handleCloseClick}
        >
          {closeAtBat.isLoading ? <Spinner h={4} w={4} /> : "End at-bat"}
        </button>
        <button
          disabled={closeAtBat.isLoading}
          type={"button"}
          className={styles.rightButton}
          onClick={handleKeepClick}
        >
          Keep it open
        </button>
      </div>
    </div>
  );
};

export default ExitDialog;
