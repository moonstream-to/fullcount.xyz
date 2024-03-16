import styles from "./PracticeView.module.css";
import parentStyles from "../HomePage/PvpView.module.css";
import { useState } from "react";
import { AtBat } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import TokenToPlay from "../HomePage/TokenToPlay";

const levels = ["Easy", "Medium", "Hard"];

const PracticeSelect = () => {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const { atBatsForPractice } = useGameContext();

  const getSelectedToken = (atBat: AtBat | undefined) => {
    if (atBat?.pitcher) return { token: atBat.pitcher, isPitcher: true };
    if (atBat?.batter) return { token: atBat.batter, isPitcher: false };
    return { token: undefined, isPitcher: false };
  };

  if (!atBatsForPractice) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      {getSelectedToken(atBatsForPractice[selectedLevel]).token && (
        <TokenToPlay
          token={getSelectedToken(atBatsForPractice[selectedLevel]).token}
          isPitcher={getSelectedToken(atBatsForPractice[selectedLevel]).isPitcher}
        />
      )}
      <div className={parentStyles.viewSelector}>
        {levels.slice(0, atBatsForPractice.length).map((v, idx) => (
          <div
            className={selectedLevel === idx ? styles.buttonSelected : styles.button}
            onClick={() => setSelectedLevel(idx)}
            key={idx}
          >
            {v}
          </div>
        ))}
      </div>
      <div className={styles.actionButton}>Train</div>
    </div>
  );
};

export default PracticeSelect;
