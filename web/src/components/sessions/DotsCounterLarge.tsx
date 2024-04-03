import styles from "./DotsCounterLarge.module.css";

const DotsCounterLarge = ({
  label,
  count,
  capacity,
}: {
  label: string;
  count: number;
  capacity: number;
}) => {
  return (
    <div className={styles.stat}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.dots}>
        {Array.from({ length: capacity }, () => 0).map((_, idx) => (
          <div key={idx} className={idx < count ? styles.filledDot : styles.emptyDot} />
        ))}
      </div>
    </div>
  );
};

export default DotsCounterLarge;
