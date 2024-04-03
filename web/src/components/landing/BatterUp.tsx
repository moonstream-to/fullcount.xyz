import styles from "./BatterUp.module.css";
import globalStyles from "./Landing.module.css";

import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS } from "../../constants";
import router from "next/router";

const BatterUp = () => {
  const handleCTA = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroContainer}>
        <div className={styles.bannerContainer}>
          <Image src={`${FULLCOUNT_ASSETS}/landing/banner.png`} alt={""} />
        </div>
        <div className={styles.heroInnerContainer}>
          <div className={styles.heroTitle}>BATTER UP!</div>
          <div className={styles.heroText}>
            Face off in epic batter vs pitcher duels
            <br />
            in this exciting baseball strategy game.
          </div>
          <div className={globalStyles.button} onClick={handleCTA}>
            PLAY NOW
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatterUp;
