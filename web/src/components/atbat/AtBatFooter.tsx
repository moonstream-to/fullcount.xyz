import styles from "./AtBatFooter.module.css";
import { AtBatStatus } from "../../types";
import TokenToPlay from "../HomePage/TokenToPlay";

const AtBatFooter = ({ atBat }: { atBat: AtBatStatus }) => {
  return (
    <div className={styles.container}>
      {atBat.pitcher ? (
        <TokenToPlay token={atBat.pitcher} isPitcher={true} isForGame={true} />
      ) : (
        <div style={{ width: "112px" }} />
      )}
      <div className={styles.vs}>VS</div>
      {atBat.batter ? (
        <TokenToPlay token={atBat.batter} isPitcher={false} isForGame={true} />
      ) : (
        <div style={{ width: "112px" }} />
      )}
    </div>
  );
};

export default AtBatFooter;
