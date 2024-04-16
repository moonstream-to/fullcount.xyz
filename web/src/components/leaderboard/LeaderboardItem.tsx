import styles from "./Leaderboard.module.css";
import { Image } from "@chakra-ui/react";
import React from "react";
import { LeaderboardEntry } from "./leaderboards";

const LeaderboardItem = ({ entry }: { entry: LeaderboardEntry }) => {
  return (
    <div key={entry.id} className={styles.tableContent}>
      <div
        className={`${entry.rank < 4 ? styles.firstRanks : styles.rank} ${
          entry.rank === 1
            ? styles.rankFirst
            : entry.rank === 2
            ? styles.rankSecond
            : entry.rank === 3
            ? styles.rankThird
            : ""
        }`}
      >
        {entry.rank}
      </div>
      <div className={styles.characterContainer}>
        <Image alt={""} className={styles.characterImage} src={entry.image} />
        <div className={styles.characterInfo}>
          <div className={styles.characterName}>{entry.name}</div>
          <div className={styles.characterId}>{entry.id}</div>
        </div>
      </div>
      <div className={styles.score}>{entry.score}</div>
    </div>
  );
};

export default LeaderboardItem;
