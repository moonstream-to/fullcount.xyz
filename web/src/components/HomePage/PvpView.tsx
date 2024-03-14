import styles from "./PvpView.module.css";
import { useState } from "react";
import { AtBat } from "../../types";
import { ZERO_ADDRESS } from "../../constants";
import TokenToPlay from "./TokenToPlay";
import AtBatsList from "./AtBatsList";
const views = ["Open", "My games", "Other"];

const PvpView = ({ atBats }: { atBats: AtBat[] }) => {
  const handlePlay = (atBat: AtBat) => {
    console.log(atBat);
  };

  const [selectedView, setSelectedView] = useState(0);
  return (
    <div className={styles.container}>
      <div className={styles.viewSelector}>
        {views.map((v, idx) => (
          <div
            className={selectedView === idx ? styles.buttonSelected : styles.button}
            onClick={() => setSelectedView(idx)}
            key={idx}
          >
            {v}
          </div>
        ))}
      </div>
      {selectedView === 2 && atBats && (
        <AtBatsList atBats={atBats.filter((a) => a.progress !== 6 && a.progress !== 2)} />
      )}
      {atBats && selectedView === 0 && (
        <div className={styles.listsContainer}>
          <div className={styles.list}>
            PITCHERS
            {atBats
              .filter((a) => a.progress === 2 && a.pitcher && a.pitcher?.address !== ZERO_ADDRESS)
              .map((openAtBat, idx) => (
                <TokenToPlay
                  token={openAtBat.pitcher}
                  isPitcher={true}
                  onClick={() => handlePlay(openAtBat)}
                  key={idx}
                />
              ))}
          </div>
          <div className={styles.list}>
            BATTERS
            {atBats
              .filter((a) => a.progress === 2 && a.batter && a.batter?.address !== ZERO_ADDRESS)
              .map((openAtBat, idx) => (
                <TokenToPlay
                  token={openAtBat.batter}
                  isPitcher={false}
                  onClick={() => handlePlay(openAtBat)}
                  key={idx}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvpView;
