import styles from "./Achievements.module.css";
import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS } from "../../constants";

const Achievements = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>...earn achievements...</div>
      <Image className={styles.image} src={`${FULLCOUNT_ASSETS}/landing/character-details.png`} />
    </div>
  );
};

export default Achievements;
