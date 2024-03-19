import styles from "./Score.module.css";
import { AtBatStatus, SessionStatus } from "../../types";
import DotsCounter from "../sessions/DotsCounter";
import { useGameContext } from "../../contexts/GameContext";
import Timer from "./Timer";

const Score = ({ atBat, pitch }: { atBat: AtBatStatus; pitch: SessionStatus }) => {
  const { secondsPerPhase } = useGameContext();

  return (
    <div className={styles.container}>
      <div className={styles.pitchNumber}>{`Pitch ${atBat.numberOfSessions}`}</div>
      <div className={styles.score}>
        <DotsCounter label={"B"} count={atBat.balls} capacity={4} />
        <DotsCounter label={"S"} count={atBat.strikes} capacity={3} />
      </div>
      <Timer
        start={pitch.phaseStartTimestamp ?? "0"}
        delay={secondsPerPhase ?? 300}
        isActive={pitch.progress === 3 || pitch.progress === 4}
      />
    </div>
  );
};

export default Score;
