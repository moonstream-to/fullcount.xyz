import styles from "./TryIt.module.css";
import globalStyles from "./Landing.module.css";
import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS } from "../../constants";
import router from "next/router";

const TryIt = () => {
  const handleCTA = () => {
    router.push("/");
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Try it now!</div>
        <div className={styles.subtitle}>The Fullcount: Nova League Season One beta is live!</div>
        <div className={styles.achievements}>
          <div className={styles.subtitle2}>Special achievements for early players</div>
          <div className={styles.row}>
            <div className={styles.item}>
              <Image
                className={styles.image}
                alt={""}
                src={`${FULLCOUNT_ASSETS}/landing/seasonal-neutral-sm.jpeg`}
              />
              <div className={styles.itemTitle}>Timber Shiverer</div>
              <div className={styles.itemText}>Defeat the Plattsburgh Pirates</div>
            </div>

            <div className={styles.item}>
              <Image
                className={styles.image}
                alt={""}
                src={`${FULLCOUNT_ASSETS}/landing/seasonal-neutral-sm.jpeg`}
              />
              <div className={styles.itemTitle}>OG BLB</div>
              <div className={styles.itemText}>
                Be one of the first 100 players to play a Fullcount at-bat
              </div>
            </div>

            <div className={styles.item}>
              <Image
                className={styles.image}
                alt={""}
                src={`${FULLCOUNT_ASSETS}/landing/seasonal-neutral-sm.jpeg`}
              />
              <div className={styles.itemTitle}>Season one pitching champ!</div>
              <div className={styles.itemText}>Defeat the season one pitching boss</div>
            </div>
          </div>
        </div>
      </div>
      <div className={globalStyles.button} onClick={handleCTA}>
        PLAY
      </div>
    </div>
  );
};

export default TryIt;
