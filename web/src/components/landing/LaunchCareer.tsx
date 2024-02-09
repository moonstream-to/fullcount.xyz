import styles from "./LaunchCareer.module.css";
import parentStyles from "./Landing.module.css";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image } from "@chakra-ui/react";
const assets = `${FULLCOUNT_ASSETS_PATH}/landing`;

const LaunchCareer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Launch your baseball career</div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Create a character</div>
        <Image w="128px" h="128px" src={`${assets}/character.png`} />
        <div className={styles.cardText}>
          Now available: Mint a free Beer League Baller NFT.
          <br />
          <br />
          Play as a batter or a pitcher — or both. <br />
          <br />
          Coming soon: Play with any NFT on any EVM chain. Turn your favorite NFT into a baseball
          star!
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Shape your legend</div>
        <Image w="150px" h="277px" src={`${assets}/batter.png`} />
        <div className={styles.cardText}>
          The more you play, the more richness you add to your character’s heat maps, achievements,
          and stats. Track your path to the big leagues — and psyche out your opponents! — as your
          record grows.
        </div>
      </div>
      <button className={parentStyles.button}>Create a character</button>
    </div>
  );
};

export default LaunchCareer;
