import styles from "./LeaderboardPositions.module.css";
import { LeaderboardPosition } from "../leaderboard/leaderboards";
import { Fragment } from "react";

const LeaderboardPositionsView = ({ positions }: { positions: LeaderboardPosition[] }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Leaderboard</div>
      <div className={styles.header}>Rank</div>
      {!!positions &&
        positions.map((entry, idx) => (
          <Fragment key={idx}>
            <div className={styles.leaderboardTitle}>{entry?.title}</div>
            <div className={styles.rank}>{entry?.rank !== Infinity ? entry?.rank : "-"}</div>
          </Fragment>
        ))}
    </div>
  );
};

export default LeaderboardPositionsView;
