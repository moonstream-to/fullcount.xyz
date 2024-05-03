import styles from "./ScoreForDesktop.module.css";
import { AtBatStatus, SessionStatus } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import Timer from "./Timer";
import { useState } from "react";
import PitchHistory from "./PitchHistory";
import ChevronUpLarge from "../icons/ChevronUpLarge";
import ChevronDownLarge from "../icons/ChevronDownLarge";
import DotsCounterLarge from "../sessions/DotsCounterLarge";
import { useSound } from "../../hooks/useSound";

const ScoreForDesktop = ({
  atBat,
  pitch,
  openHistory = false,
}: {
  atBat: AtBatStatus;
  pitch: SessionStatus;
  openHistory?: boolean;
}) => {
  const { secondsPerPhase } = useGameContext();
  const [isHistoryOpen, setIsHistoryOpen] = useState(openHistory);
  const playSound = useSound();

  return (
    <div className={styles.container}>
      {isHistoryOpen && <PitchHistory atBat={atBat} />}
      <div
        className={styles.pitches}
        onClick={() => {
          playSound(isHistoryOpen ? "pitchHistoryClose" : "pitchHistoryOpen");
          setIsHistoryOpen(!isHistoryOpen);
        }}
      >
        <div className={styles.pitchNumber}>{`Pitch ${atBat.numberOfSessions}`}</div>
        {isHistoryOpen ? <ChevronUpLarge /> : <ChevronDownLarge />}
      </div>
      <div className={styles.content}>
        <div className={styles.score}>
          <DotsCounterLarge label={"Ball"} count={atBat.balls} capacity={4} />
          <DotsCounterLarge label={"Strike"} count={atBat.strikes} capacity={3} />
        </div>
        <Timer
          start={pitch?.phaseStartTimestamp ?? "0"}
          delay={secondsPerPhase ?? 120}
          isActive={pitch?.progress === 3 || pitch?.progress === 4}
        />
      </div>
    </div>
  );
};

export default ScoreForDesktop;
