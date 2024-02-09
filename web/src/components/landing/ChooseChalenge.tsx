import styles from "./ChooseChalenge.module.css";
import parentStyles from "./Landing.module.css";
import PvPIcon from "../icons/PvPIcon";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image } from "@chakra-ui/react";
const assets = `${FULLCOUNT_ASSETS_PATH}/landing`;

const ChooseChalenge = () => {
  return (
    <div className={styles.container}>
      <div className={styles.chalengeContainer}>
        <PvPIcon />
        <div className={styles.textContainer}>
          <div className={styles.chalengeTitle}>Play PvP mode</div>
          <div className={styles.chalengeText}>
            Play an at-bat against a human opponent or invite a friend.
          </div>
        </div>
      </div>
      <div className={styles.chalengeContainer}>
        <Image src={`${assets}/campaign.svg`} />
        <div className={styles.textContainer}>
          <div className={styles.chalengeTitle}>Play a campaign</div>
          <div className={styles.chalengeText}>Take on the BaseBots: Can you defeat them all?</div>
        </div>
      </div>
      <button className={parentStyles.button}>Play</button>
    </div>
  );
};

export default ChooseChalenge;
