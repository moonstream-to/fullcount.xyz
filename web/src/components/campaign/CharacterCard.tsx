import styles from "./Character.module.css";
import { AtBat, OwnedToken, Token } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import useUser from "../../contexts/UserContext";
import useMoonToast from "../../hooks/useMoonToast";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
import router from "next/router";
import { useGameContext } from "../../contexts/GameContext";
import { Spinner, Image } from "@chakra-ui/react";
import { Character } from "./teams";
import CharacterProgress from "./CharacterProgress";
import { sendReport } from "../../utils/humbug";
import { useSound } from "../../hooks/useSound";
import { useJoinSession } from "../../hooks/useJoinSession";

const CharacterCard = ({
  character,
  atBat,
  color,
  isStatsLoading,
}: {
  character?: {
    token: { address: string; id: string } | undefined;
    character: Character | undefined;
  };
  atBat?: AtBat;
  color: string;
  isStatsLoading: boolean;
}) => {
  const { selectedToken } = useGameContext();
  const playSound = useSound();

  const joinSession = useJoinSession();

  const handlePlay = (atBat: AtBat | undefined) => {
    playSound(atBat?.pitcher ? "batButton" : "pitchButton");
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
      <Image
        fallback={<div className={styles.tokenImageFallback} />}
        className={styles.image}
        alt={""}
        src={atBat.pitcher?.image ?? atBat.batter?.image}
      />
      <div className={styles.header}>
        <div className={styles.name}>{`${character?.character?.name}`}</div>
        <div className={styles.quote}>{character?.character?.quote}</div>
      </div>
      {(character.character?.wins || character.character?.wins === 0) && (
        <CharacterProgress
          isStatsLoading={isStatsLoading}
          stat={{
            label: atBat.pitcher ? "Score 3 HR" : "Score a strikeout in 3 pitches",
            finished: character.character.wins,
            total: 3,
          }}
          color={color}
        />
      )}
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

export default CharacterCard;
