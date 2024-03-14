import styles from "./AtBatsList.module.css";
import { AtBat, OwnedToken } from "../../types";
import AtBatView from "./AtBatView";

const AtBatsList = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
  return (
    <div className={styles.container}>
      {atBats.map((a, idx) => (
        <AtBatView atBat={a} key={idx} tokens={tokens} />
      ))}
    </div>
  );
};

export default AtBatsList;
