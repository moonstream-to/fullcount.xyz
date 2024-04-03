import { Token } from "../../types";
import styles from "./PlayerStat.module.css";

const PlayerStat = ({
  token,
  pitchingCompleted,
  battingCompleted,
  isStatsLoading,
}: {
  token: Token;
  pitchingCompleted: number;
  battingCompleted: number;
  isStatsLoading: boolean;
}) => {
  const stats = (pitching: number, batting: number) => {
    return [
      { label: "Pitching", finished: pitching, total: 5 },
      { label: "Batting", finished: batting, total: 5 },
    ];
  };

  return (
    <div className={styles.container}>
      <div className={styles.tokenInfo}>
        <img className={styles.tokenImage} src={token.image} alt={""} />
        <div className={styles.tokenNameId}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenId}>{token.id}</div>
        </div>
      </div>
      <div className={styles.tokenStatList}>
        {stats(pitchingCompleted, battingCompleted).map((stat, idx) => (
          <div key={idx} className={styles.tokenStatItem}>
            <div className={styles.statHeader}>
              <div className={styles.label}>{stat.label}</div>
              {!isStatsLoading && (
                <div className={styles.completion}>{`${stat.finished}${stat.total ? "/" : ""}${
                  stat.total ? stat.total : ""
                }`}</div>
              )}
            </div>
            {stat.total && (
              <div className={styles.notFinishedBar}>
                <div
                  className={`${styles.finishedBar} ${
                    !isStatsLoading ? "" : idx === 0 ? styles.loadingBar1 : styles.loadingBar2
                  }`}
                  style={isStatsLoading ? {} : { width: `${(100 * stat.finished) / stat.total}%` }}
                />
              </div>
            )}
          </div>
        ))}
        <div className={styles.statHeader}>
          <div className={styles.label}></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStat;
