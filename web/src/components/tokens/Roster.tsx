import styles from "./Roster.module.css";
import { OwnedToken } from "../../types";
import { Image } from "@chakra-ui/react";
import NewCharacterButton from "./NewCharacterButton";
import PlayButtons from "./PlayButtons";
import { useGameContext } from "../../contexts/GameContext";
import { useSound } from "../../hooks/useSound";
import LeaderboardPositions from "./LeaderboardPositions";
import { useQuery } from "react-query";
import { fetchAllLeaderboardsPositions } from "../leaderboard/leaderboards";

const Roster = ({ tokens }: { tokens: OwnedToken[] }) => {
  const { updateContext, selectedMode, selectedTokenIdx } = useGameContext();
  const playSound = useSound();

  const handleClick = (idx: number) => {
    playSound("characterSelector");
    updateContext({ selectedToken: { ...tokens[idx] }, selectedTokenIdx: idx });
  };

  const leaderboards = useQuery(["allLeaderboardsPositions, tokens"], () =>
    fetchAllLeaderboardsPositions(tokens),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>roster</div>
      <div className={styles.tokens}>
        {tokens[selectedTokenIdx] && (
          <div className={styles.selectedTokenContainer}>
            <Image src={tokens[selectedTokenIdx].image} alt={""} className={styles.bigTokenImage} />
            <div className={styles.tokenInfo}>
              <div className={styles.tokenName}>{tokens[selectedTokenIdx].name}</div>
              <div className={styles.tokenId}>{tokens[selectedTokenIdx].id}</div>
            </div>
            {selectedMode === 0 ||
            (!!tokens[selectedTokenIdx].stakedSessionID &&
              tokens[selectedTokenIdx].tokenProgress !== 6) ? (
              <PlayButtons token={tokens[selectedTokenIdx]} />
            ) : (
              <div style={{ minHeight: "40px" }} />
            )}
          </div>
        )}
        <div className={styles.tokensAndLeaderboard}>
          <div className={styles.tokenCards}>
            {tokens.map((t, idx) => (
              <Image
                key={idx}
                src={t.image}
                fallback={<div className={styles.tokenImageFallback} />}
                alt={""}
                className={selectedTokenIdx === idx ? styles.selectedTokenImage : styles.tokenImage}
                onClick={() => handleClick(idx)}
              />
            ))}
            <NewCharacterButton small={true} />
          </div>
          {leaderboards.data && (
            <LeaderboardPositions
              positions={leaderboards.data
                .flat(1)
                .filter(
                  (p) =>
                    p &&
                    p.token.id === tokens[selectedTokenIdx].id &&
                    p.token.id === tokens[selectedTokenIdx].id,
                )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Roster;
