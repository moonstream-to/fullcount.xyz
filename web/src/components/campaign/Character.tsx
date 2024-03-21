import styles from "./Character.module.css";
import { Character } from "./TeamsView";
import { AtBat, OwnedToken, Token } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import useUser from "../../contexts/UserContext";
import useMoonToast from "../../hooks/useMoonToast";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import router from "next/router";
import { useGameContext } from "../../contexts/GameContext";
import { Spinner } from "@chakra-ui/react";

const Character = ({
  character,
  atBat,
  color,
}: {
  character?: {
    token: { address: string; id: string } | undefined;
    character: Character | undefined;
  };
  atBat?: AtBat;
  color: string;
}) => {
  const { selectedToken } = useGameContext();
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

  if (!character || !atBat || atBat.progress !== 2 || !(atBat.pitcher || atBat.batter)) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <img className={styles.image} alt={""} src={atBat.pitcher?.image ?? atBat.batter?.image} />
      <div className={styles.header}>
        <div className={styles.name}>{character?.character?.name}</div>
        <div className={styles.quote}>{character?.character?.quote}</div>
      </div>
      <div
        className={styles.startButton}
        style={{ backgroundColor: color }}
        onClick={() => handlePlay(atBat)}
      >
        {joinSession.isLoading ? (
          <Spinner h={4} w={4} />
        ) : joinSession.isSuccess ? (
          "Success"
        ) : (
          "start game"
        )}
      </div>
    </div>
  );
};

export default Character;
