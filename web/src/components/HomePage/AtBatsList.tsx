import styles from "./AtBatsList.module.css";
import { AtBat, OwnedToken } from "../../types";
import AtBatItem from "./AtBatItem";

const AtBatsList = ({ atBats, tokens }: { atBats: AtBat[]; tokens: OwnedToken[] }) => {
  return (
    <div className={styles.container}>
      {atBats.map((a, idx) => (
        <AtBatItem atBat={a} key={idx} tokens={tokens} />
      ))}
    </div>
  );
};

export default AtBatsList;
