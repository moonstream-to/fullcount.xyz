import styles from "./AtBatsList.module.css";
import { AtBat } from "../../types";
import AtBatView from "./AtBatView";

const AtBatsList = ({ atBats }: { atBats: AtBat[] }) => {
  return (
    <div className={styles.container}>
      {atBats.map((a, idx) => (
        <AtBatView atBat={a} key={idx} />
      ))}
    </div>
  );
};

export default AtBatsList;
