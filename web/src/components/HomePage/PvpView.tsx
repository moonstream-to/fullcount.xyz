import styles from "./PvpView.module.css";
import { useState } from "react";
import { AtBat, OwnedToken } from "../../types";
import { ZERO_ADDRESS } from "../../constants";
import TokenToPlay from "./TokenToPlay";
import AtBatsList from "./AtBatsList";
const views = ["Open", "My games", "Other"];

const PvpView = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
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
        <AtBatsList
          tokens={tokens}
          atBats={atBats.filter(
            (a) =>
              a.progress !== 6 &&
              a.progress !== 2 &&
              !tokens.some(
                (t) =>
                  (t.address === a.pitcher?.address && t.id === a.pitcher.id) ||
                  (t.address === a.batter?.address && t.id === a.batter.id),
              ),
          )}
        />
      )}
      {selectedView === 1 && atBats && (
        <AtBatsList
          tokens={tokens}
          atBats={atBats.filter(
            (a) =>
              a.progress !== 6 &&
              tokens.some(
                (t) =>
                  (t.address === a.pitcher?.address && t.id === a.pitcher.id) ||
                  (t.address === a.batter?.address && t.id === a.batter.id),
              ),
          )}
        />
      )}
      {atBats && selectedView === 0 && (
        <div className={styles.listsContainer}>
          <div className={styles.list}>
            PITCHERS
            {atBats
              .filter((a) => a.progress === 2 && a.pitcher && a.pitcher?.address !== ZERO_ADDRESS)
              .map((openAtBat, idx) => {
                return openAtBat.pitcher ? (
                  <TokenToPlay
                    token={openAtBat.pitcher}
                    isPitcher={true}
                    onClick={() => handlePlay(openAtBat)}
                    key={idx}
                  />
                ) : (
                  <div style={{ width: "130px", height: "225.5px" }} />
                );
              })}
          </div>
          <div className={styles.list}>
            BATTERS
            {atBats
              .filter((a) => a.progress === 2 && a.batter && a.batter?.address !== ZERO_ADDRESS)
              .map((openAtBat, idx) => {
                return openAtBat.batter ? (
                  <TokenToPlay
                    token={openAtBat.batter}
                    isPitcher={false}
                    onClick={() => handlePlay(openAtBat)}
                    key={idx}
                  />
                ) : (
                  <div style={{ width: "130px", height: "225.5px" }} />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvpView;
