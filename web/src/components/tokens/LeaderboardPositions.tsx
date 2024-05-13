import styles from "./LeaderboardPositions.module.css";
import { Token } from "../../types";
import { useQuery } from "react-query";
import { fetchLeaderboardsPositions } from "../leaderboard/leaderboards";
import { Fragment } from "react";

const LeaderboardPositionsView = ({ token }: { token: Token }) => {
  const leaderboardPositions = useQuery(["leaderboard_position", token.address, token.id], () =>
    fetchLeaderboardsPositions(token),
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>Leaderboard</div>
      <div className={styles.header}>Rank</div>
      {!!leaderboardPositions.data &&
        leaderboardPositions.data.map((entry, idx) => (
          <Fragment key={idx}>
            <div className={styles.leaderboardTitle}>{entry?.title}</div>
            <div className={styles.rank}>{entry?.rank}</div>
          </Fragment>
        ))}
    </div>
  );
};

export default LeaderboardPositionsView;
