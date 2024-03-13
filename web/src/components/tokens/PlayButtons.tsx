import styles from "./Roster.module.css";
import { Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
import useUser from "../../contexts/UserContext";
import { AtBat, OwnedToken, Token } from "../../types";
import { startSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import { getLocalStorageInviteCodeKey, setLocalStorageItem } from "../../utils/localStorage";
import { GAME_CONTRACT, ZERO_ADDRESS } from "../../constants";

const PlayButtons = ({ token }: { token: OwnedToken }) => {
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const { user } = useUser();
  const startSession = useMutation(
    async ({
      role,
      token,
      requireSignature,
    }: {
      role: number;
      token: OwnedToken;
      requireSignature: boolean;
    }): Promise<{ sessionID: string; sign: string | undefined; atBat: AtBat; token: Token }> => {
      const { sessionID, sign } = await startSessionFullcountPlayer({
        token,
        roleNumber: role,
        requireSignature,
      });
      const atBat: AtBat = {
        balls: 0,
        strikes: 0,
        batter: role === 0 ? undefined : token,
        pitcher: role === 0 ? token : undefined,
        outcome: 0,
        progress: 2,
      };
      return { sessionID, sign, atBat, token };
    },
    {
      onSuccess: async (
        data: { sessionID: string; sign: string | undefined; atBat: AtBat; token: Token },
        variables,
      ) => {
        if (data.sign) {
          const inviteCodeKey = getLocalStorageInviteCodeKey(GAME_CONTRACT, data.sessionID);
          setLocalStorageItem(inviteCodeKey, data.sign);
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
                stakedSessionID: Number(data.sessionID),
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
      },
      onError: (e: Error) => {
        toast("Start failed: " + e?.message, "error");
      },
    },
  );

  return (
    <div className={styles.buttonsContainer}>
      {(!token.isStaked ||
        token.tokenProgress === 6 ||
        (token.activeSession?.batterNFT.nftAddress === token.address &&
          token.activeSession?.batterNFT.tokenID === token.id)) && (
        <div
          className={styles.button}
          onClick={() =>
            startSession.mutate({
              role: 1,
              token,
              requireSignature: false,
            })
          }
        >
          {startSession.isLoading && startSession.variables?.role === 1 ? (
            <Spinner h={4} w={4} />
          ) : (
            "Bat"
          )}
        </div>
      )}
      {(!token.isStaked ||
        token.tokenProgress === 6 ||
        (token.activeSession?.pitcherNFT.nftAddress === token.address &&
          token.activeSession?.pitcherNFT.tokenID === token.id)) && (
        <div
          className={styles.button}
          onClick={() =>
            startSession.mutate({
              role: 0,
              token,
              requireSignature: false,
            })
          }
        >
          {startSession.isLoading && startSession.variables?.role === 0 ? (
            <Spinner h={4} w={4} />
          ) : (
            "Pitch"
          )}
        </div>
      )}
    </div>
  );
};

export default PlayButtons;
