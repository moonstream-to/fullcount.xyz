import styles from "./AtBatsList.module.css";
import { AtBat } from "../../types";
import TokenToPlay from "./TokenToPlay";

const AtBatView = ({ atBat }: { atBat: AtBat }) => {
  return (
    <div className={styles.atBatContainer}>
      <div className={styles.cards}>
        {atBat.batter ? (
          <TokenToPlay token={atBat.batter} isPitcher={false} />
        ) : (
          <div style={{ width: "100px", height: "152px" }} />
        )}
        <div className={styles.vs}>VS</div>
        {atBat.pitcher ? (
          <TokenToPlay token={atBat.pitcher} isPitcher={true} />
        ) : (
          <div style={{ width: "100px", height: "152px" }} />
        )}
      </div>
    </div>
  );
};

export default AtBatView;
