import styles from "./Leaderboard.module.css";
import React from "react";

const LeaderboardHeader = () => {
  return (
    <div className={styles.tableHeader}>
      <div className={styles.header}>Rank</div>
      <div className={styles.header}>Character</div>
      <div className={styles.header} style={{ textAlign: "end" }}>
        Score
      </div>
    </div>
  );
};

export default LeaderboardHeader;
