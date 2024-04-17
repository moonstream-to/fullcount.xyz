import styles from "./OwnPositions.module.css";
import { Token } from "../../types";
import { useQuery } from "react-query";
import { fetchPositionForTokens } from "./leaderboards";
import { useGameContext } from "../../contexts/GameContext";
import LeaderboardHeader from "./LeaderboardHeader";
import LeaderboardItem from "./LeaderboardItem";

const OwnPositions = ({
  tokens,
  leaderboardId,
}: {
  tokens: Token[] | undefined;
  leaderboardId: string;
}) => {
  const { tokensCache } = useGameContext();

  const ownPositions = useQuery(
    ["own_leaderboard_positions", tokens, leaderboardId],
    async () => {
      if (!tokens) {
        return [];
      }
      return fetchPositionForTokens(leaderboardId, tokens, tokensCache);
    },
    {
      enabled: !!tokens,
    },
  );

  return (
    <div
      className={styles.container}
      style={{
        height: ownPositions.data
          ? `${52 + ownPositions.data.length * 39}px`
          : tokens
          ? `${52 + tokens.length * 39}px`
          : "52px",
      }}
    >
      <LeaderboardHeader />
      {ownPositions.data &&
        ownPositions.data.map((entry, idx) => <LeaderboardItem entry={entry} key={idx} />)}
    </div>
  );
};

export default OwnPositions;
