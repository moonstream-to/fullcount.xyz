import styles from "./ChooseChallenge.module.css";
import parentStyles from "./Landing.module.css";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image } from "@chakra-ui/react";
import Link from "next/link";
const assets = `${FULLCOUNT_ASSETS_PATH}/landing`;

const ChooseChallenge = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Choose your challenge</div>
      <div className={styles.challengesContainer}>
        <div className={styles.challengeContainer}>
          <Image
            src={`${assets}/PvP2.svg`}
            w={{ base: "50px", md: "70px" }}
            h={{ base: "50px", md: "70px" }}
            alt="PvP"
          />
          <div className={styles.textContainer}>
            <div className={styles.challengeTitle}>Play PvP mode</div>
            <div className={styles.challengeText}>
              Play an at-bat against a human opponent or invite a friend.
            </div>
          </div>
        </div>
        <div className={styles.challengeContainer}>
          <Image
            src={`${assets}/campaign.svg`}
            w={{ base: "50px", md: "70px" }}
            h={{ base: "50px", md: "70px" }}
            alt="campaign"
          />
          <div className={styles.textContainer}>
            <div className={styles.challengeTitle}>Play a campaign</div>
            <div className={styles.challengeText}>
              Take on the BaseBots: Can you defeat them all?
            </div>
          </div>
        </div>
      </div>
      <Link href="/" passHref>
        <button className={parentStyles.button}>Play</button>
      </Link>
    </div>
  );
};

export default ChooseChallenge;
