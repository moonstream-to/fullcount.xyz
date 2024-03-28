import styles from "./Strikeout.module.css";
import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS } from "../../constants";

const Strikeout = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>...and win your place in the Hall of Fame</div>
      <Image className={styles.image} src={`${FULLCOUNT_ASSETS}/landing/game.png`} />
    </div>
  );
};

export default Strikeout;
