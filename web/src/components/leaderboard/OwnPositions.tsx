import styles from "./OwnPositions.module.css";
import { Token } from "../../types";
import { useQuery } from "react-query";
import { fetchPositionForTokens } from "./leaderboards";
import { useGameContext } from "../../contexts/GameContext";
import LeaderboardHeader from "./LeaderboardHeader";
import LeaderboardItem from "./LeaderboardItem";

const OwnPositions = ({ tokens, leaderboardId }: { tokens: Token[]; leaderboardId: string }) => {
  const { tokensCache } = useGameContext();

  const ownPositions = useQuery(["own_leaderboard_positions", tokens, leaderboardId], async () => {
    return fetchPositionForTokens(leaderboardId, tokens, tokensCache);
  });

  return (
    <div className={styles.container}>
      <LeaderboardHeader />
      {ownPositions.data &&
        ownPositions.data.map((entry, idx) => <LeaderboardItem entry={entry} key={idx} />)}
    </div>
  );
};

export default OwnPositions;
