import styles from "./Roster.module.css";
import { Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
import useUser from "../../contexts/UserContext";
import { AtBat, OwnedToken, Token } from "../../types";
import { startSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { getLocalStorageInviteCodeKey, setAppStorageItem } from "../../utils/localStorage";
import { GAME_CONTRACT, PLAYER_INTERFACE, ZERO_ADDRESS } from "../../constants";
import { useRouter } from "next/router";
import { sendReport } from "../../utils/humbug";
import { useSound } from "../../hooks/useSound";
import { useState } from "react";
import StartAtBatDialog from "./StartAtBatDialog";
import globalStyles from "../GlobalStyles.module.css";
import { startSessionTrustedExecutor } from "../../tokenInterfaces/TrustedExecutorAPI";

const PlayButtons = ({ token }: { token: OwnedToken }) => {
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const router = useRouter();
  const { user } = useUser();
  const playSound = useSound();
  const [role, setRole] = useState<0 | 1 | undefined>(undefined);

  const startSession = useMutation(
    async ({
      role,
      token,
      requireSignature,
    }: {
      role: 0 | 1;
      token: OwnedToken;
      requireSignature: boolean;
    }): Promise<{
      sessionID: string | undefined;
      atBatID: string | undefined;
      inviteCode: string | undefined;
      atBat: AtBat;
      token: Token;
    }> => {
      const { sessionID, atBatID, inviteCode } =
        PLAYER_INTERFACE === "FULLCOUNT_PLAYER"
          ? await startSessionFullcountPlayer({
              token,
              role,
              requireSignature,
            })
          : await startSessionTrustedExecutor({
              token,
              role,
              requireSignature,
            });
      const atBat: AtBat = {
        balls: 0,
        strikes: 0,
        batter: role === 0 ? undefined : token,
        pitcher: role === 0 ? token : undefined,
        outcome: 0,
        progress: 2,
        requiresSignature: requireSignature,
        id: atBatID,
      };
      return { sessionID, atBatID, inviteCode, atBat, token };
    },
    {
      onSuccess: async (
        data: {
          sessionID: string | undefined;
          atBatID: string | undefined;
          inviteCode: string | undefined;
          atBat: AtBat;
          token: Token;
        },
        variables,
      ) => {
        if (data.inviteCode && (data.sessionID || data.atBatID)) {
          const id = data.atBatID ?? data.sessionID;
          if (data.inviteCode && id) {
            const inviteCodeKey = getLocalStorageInviteCodeKey(GAME_CONTRACT, id);
            setAppStorageItem(inviteCodeKey, data.inviteCode);
          }
        }
        queryClient.setQueryData(
          ["atBats"],
          (oldData: { atBats: AtBat[]; tokens: Token[] } | undefined) => {
            return oldData
              ? { atBats: [data.atBat, ...oldData.atBats], tokens: [data.token, ...oldData.tokens] }
              : { atBats: [data.atBat], tokens: [data.token] };
          },
        );
        queryClient.setQueryData(["owned_tokens", user], (oldData: OwnedToken[] | undefined) => {
          if (!oldData) {
            return [];
          }
          return oldData.map((t) => {
            if (t.address === variables.token.address && t.id === variables.token.id) {
              const emptyToken = { nftAddress: ZERO_ADDRESS, tokenID: "0" };
              const nft = { nftAddress: t.address, tokenID: t.id };
              return {
                ...t,
                isStaked: true,
                stakedSessionID: Number(data.sessionID ?? 0),
                stakedAtBatID: data.atBatID,
                tokenProgress: 2,
                activeSession:
                  variables.role === 0
                    ? { batterNFT: emptyToken, pitcherNFT: nft }
                    : { batterNFT: nft, pitcherNFT: emptyToken },
              };
            }
            return t;
          });
        });
        if (data.atBatID) {
          router.push(`atbats/?id=${data.atBatID}`);
        } else if (data.sessionID) {
          router.push(`atbats/?session_id=${data.sessionID}`);
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
        toast("Start failed: " + e?.message, "error");
        sendReport("Error toast", { error: e }, ["type:error_toast"]);
      },
    },
  );

  const handleClick = (role: 0 | 1) => {
    playSound(role === 0 ? "pitchButton" : "batButton");
    if (token.tokenProgress !== 6 && token.stakedSessionID) {
      router.push(`atbats/?session_id=${token.stakedSessionID}`);
      return;
    }
    if (token.tokenProgress !== 6 && token.stakedAtBatID) {
      router.push(`atbats/?id=${token.stakedAtBatID}`);
      return;
    }
    if (PLAYER_INTERFACE === "FULLCOUNT_PLAYER") {
      setRole(role);
    } else {
      startSession.mutate({ role, token, requireSignature: false });
    }
  };

  const handleChoice = (requireSignature: boolean) => {
    if (role === undefined) {
      return;
    }
    startSession.mutate({
      role,
      token,
      requireSignature,
    });
    setRole(undefined);
  };

  return (
    <div className={styles.buttonsContainer}>
      {role !== undefined && (
        <StartAtBatDialog onClick={handleChoice} onClose={() => setRole(undefined)} />
      )}
      {role !== undefined && <div className={globalStyles.overlay} />}

      {(!token.isStaked ||
        token.tokenProgress === 6 ||
        (token.activeSession?.batterNFT.nftAddress === token.address &&
          token.activeSession?.batterNFT.tokenID === token.id)) && (
        <button
          className={styles.button}
          disabled={startSession.isLoading}
          style={{ zIndex: role === 0 ? 0 : 1, cursor: role === undefined ? "pointer" : "default" }}
          onClick={() => handleClick(1)}
        >
          {startSession.isLoading && startSession.variables?.role === 1 ? (
            <Spinner h={4} w={4} />
          ) : (
            "Bat"
          )}
        </button>
      )}
      {(!token.isStaked ||
        token.tokenProgress === 6 ||
        (token.activeSession?.pitcherNFT.nftAddress === token.address &&
          token.activeSession?.pitcherNFT.tokenID === token.id)) && (
        <button
          disabled={startSession.isLoading}
          className={styles.button}
          style={{ zIndex: role === 1 ? 0 : 1, cursor: role === undefined ? "pointer" : "default" }}
          onClick={() => handleClick(0)}
        >
          {startSession.isLoading && startSession.variables?.role === 0 ? (
            <Spinner h={4} w={4} />
          ) : (
            "Pitch"
          )}
        </button>
      )}
    </div>
  );
};

export default PlayButtons;
