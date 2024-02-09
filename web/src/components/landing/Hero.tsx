import styles from "./Landing.module.css";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image } from "@chakra-ui/react";
import FullcountLogo from "../icons/FullcountLogo";
const assets = `${FULLCOUNT_ASSETS_PATH}/landing`;

const Hero = () => {
  return (
    <div className={styles.heroContainer}>
      <FullcountLogo />
      <Image w="100%" src={`${assets}/hero-illustration-sm.png`} />
      <div className={styles.heroTextContainer}>
        <div className={styles.heroTextTitle}>Become a baseball legend with Fullcount</div>
        <div className={styles.heroTextText}>
          Experience the epic duel between batter and pitcher in this fully on-chain baseball
          strategy game.
        </div>
        <button className={styles.button}>Playtest now</button>
      </div>
    </div>
  );
};

export default Hero;
