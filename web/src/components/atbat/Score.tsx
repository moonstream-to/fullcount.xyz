import styles from "./Score.module.css";
import { AtBatStatus, SessionStatus } from "../../types";
import DotsCounter from "../sessions/DotsCounter";
import { useGameContext } from "../../contexts/GameContext";
import Timer from "./Timer";
import { useState } from "react";
import ChevronUp from "../icons/ChevronUp";
import ChevronDown from "../icons/ChevronDown";
import PitchHistory from "./PitchHistory";

const Score = ({
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

  return (
    <div className={styles.container}>
      {isHistoryOpen && <PitchHistory atBat={atBat} />}
      <div className={styles.pitches} onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
        <div className={styles.pitchNumber}>{`Pitch ${atBat.numberOfSessions}`}</div>
        {isHistoryOpen ? <ChevronUp /> : <ChevronDown />}
      </div>
      <div className={styles.score}>
        <DotsCounter label={"B"} count={atBat.balls} capacity={4} />
        <DotsCounter label={"S"} count={atBat.strikes} capacity={3} />
      </div>
      <Timer
        start={pitch.phaseStartTimestamp ?? "0"}
        delay={secondsPerPhase ?? 120}
        isActive={pitch.progress === 3 || pitch.progress === 4}
      />
    </div>
  );
};

export default Score;
