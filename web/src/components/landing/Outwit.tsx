import styles from "./Outwit.module.css";
import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS } from "../../constants";

const Outwit = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Outwit your friends...</div>
      <div className={styles.faceOff}>
        <div className={styles.pitcher}>
          <Image alt={""} src={`${FULLCOUNT_ASSETS}/landing/8.jpeg`} />
          <Image
            className={styles.ball}
            alt={""}
            src={`${FULLCOUNT_ASSETS}/landing/baseball.svg`}
          />
        </div>
        <div className={styles.vs}>VS</div>
        <div className={styles.batter}>
          <Image alt={""} src={`${FULLCOUNT_ASSETS}/landing/4.jpeg`} />
          <Image
            className={styles.bat}
            alt={""}
            src={`${FULLCOUNT_ASSETS}/landing/baseball-bat.svg`}
          />
        </div>
      </div>
    </div>
  );
};

export default Outwit;
