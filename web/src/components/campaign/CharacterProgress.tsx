import styles from "./Character.module.css";

const CharacterProgress = ({
  stat,
  color,
  isStatsLoading,
}: {
  stat: { label: string; finished: number; total: number };
  color: string;
  isStatsLoading: boolean;
}) => {
  return (
    <div className={styles.tokenStatItem} style={{ borderColor: color }}>
      <div className={styles.statHeader}>
        <div className={styles.label}>{stat.label}</div>
        {!isStatsLoading && (
          <div className={styles.completion}>{`${Math.min(stat.finished, stat.total)}${
            stat.total ? "/" : ""
          }${stat.total ? stat.total : ""}`}</div>
        )}
      </div>
      {stat.total && (
        <div className={styles.notFinishedBar} style={{ borderColor: color }}>
          <div
            className={`${styles.finishedBar} ${isStatsLoading ? styles.loadingBar : ""}`}
            style={
              isStatsLoading
                ? {}
                : { width: `${(100 * Math.min(stat.finished, stat.total)) / stat.total}%` }
            }
          />
        </div>
      )}
    </div>
  );
};

export default CharacterProgress;
