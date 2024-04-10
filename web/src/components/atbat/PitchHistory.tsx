import styles from "./PitchHistory.module.css";
import { AtBatStatus } from "../../types";
import BallIcon from "../icons/BallIcon";
import HistoryGrid from "./HistoryGrid";
import BatIcon from "../icons/BatIcon";
import { useGameContext } from "../../contexts/GameContext";
import { sessionOutcomeType } from "./Outcome2";
import { sessionOutcomes } from "./AtBatView";

const completedPitchesNumber = (atBat: AtBatStatus) =>
  atBat.pitches.filter((p) => p.progress === 5).length;

const PitchHistory = ({ atBat }: { atBat: AtBatStatus }) => {
  const { selectedToken } = useGameContext();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>PITCH HISTORY</div>
        {completedPitchesNumber(atBat) > 0 && (
          <div className={styles.total}>{`${completedPitchesNumber(atBat)} PITCH${
            completedPitchesNumber(atBat) === 1 ? "" : "ES"
          }`}</div>
        )}
      </div>
      <div className={styles.list}>
        {atBat.pitches
          .filter((p) => p.progress === 5)
          .map((p, idx) => (
            <div className={styles.item} key={idx}>
              <div className={styles.itemText}>{idx + 1}</div>
              <div className={styles.info}>
                <BallIcon />
                <HistoryGrid
                  vertical={p.pitcherReveal.vertical}
                  horizontal={p.pitcherReveal.horizontal}
                />
                <div className={styles.itemText}>
                  {p.pitcherReveal.speed === "0" ? "FAST" : "SLOW"}
                </div>
                <div className={styles.divider} />
                <HistoryGrid
                  vertical={p.batterReveal.kind === "2" ? "-1" : p.batterReveal.vertical}
                  horizontal={p.batterReveal.kind === "2" ? "-1" : p.batterReveal.horizontal}
                />
                <div className={styles.itemText}>
                  {p.batterReveal.kind === "0"
                    ? "CONTACT"
                    : p.batterReveal.kind === "1"
                    ? "POWER"
                    : "TAKE"}
                </div>
                <BatIcon />
              </div>
              {selectedToken && (
                <div
                  className={
                    sessionOutcomeType([selectedToken], atBat, p) === "positive"
                      ? styles.positiveOutcome
                      : styles.negativeOutcome
                  }
                >
                  {sessionOutcomes[p.outcome]}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default PitchHistory;
