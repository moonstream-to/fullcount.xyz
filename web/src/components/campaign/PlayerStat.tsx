import { Token } from "../../types";
import styles from "./PlayerStat.module.css";
import { useQuery } from "react-query";

const PlayerStat = ({ token }: { token: Token }) => {
  const stats = useQuery(["stats", token.id, token.address], async () => {
    return [
      { label: "Pitching", finished: 1, total: 5 },
      { label: "Batting", finished: 0, total: 5 },
      { label: "Total at-bats", finished: 89 },
    ];
  });
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
        {stats.data &&
          stats.data.map((stat, idx) => (
            <div key={idx} className={styles.tokenStatItem}>
              <div className={styles.statHeader}>
                <div className={styles.label}>{stat.label}</div>
                <div className={styles.completion}>{`${stat.finished}${stat.total ? "/" : ""}${
                  stat.total ? stat.total : ""
                }`}</div>
              </div>
              {stat.total && (
                <div className={styles.notFinishedBar}>
                  <div
                    className={styles.finishedBar}
                    style={{ width: `${(100 * stat.finished) / stat.total}%` }}
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
