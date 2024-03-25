import styles from "./DetailedStat.module.css";
import { PlayerStats } from "../../types";
const formatDecimal = (value: number) => {
  if (!value) {
    return ".000";
  }
  const formattedNumber = value.toFixed(3);

  // removing the leading zero:
  return formattedNumber.replace(/^0+/, "");
};

const pitcherRecord = (stats: PlayerStats): string => {
  const wins =
    stats.points_data.pitching_data.strikeouts + stats.points_data.pitching_data.in_play_outs;
  const losses =
    stats.points_data.pitching_data.singles +
    stats.points_data.pitching_data.doubles +
    stats.points_data.pitching_data.triples +
    stats.points_data.pitching_data.home_runs +
    stats.points_data.pitching_data.walks;
  return `${wins}-${losses}`;
};

const pitcherAtBatsCount = (stats: PlayerStats): number => {
  return (
    stats.points_data.pitching_data.singles +
    stats.points_data.pitching_data.doubles +
    stats.points_data.pitching_data.triples +
    stats.points_data.pitching_data.home_runs +
    stats.points_data.pitching_data.strikeouts +
    stats.points_data.pitching_data.in_play_outs +
    stats.points_data.pitching_data.walks
  );
};

const DataRow = ({ label, data }: { label: string; data: string }) => {
  return (
    <>
      <div className={styles.dataRow}>
        <div className={styles.text}>{label}</div>
        <div className={styles.text}>{data}</div>
      </div>
      <div className={styles.divider} />
    </>
  );
};

const DetailedStat = ({ stats, isPitcher }: { stats: PlayerStats; isPitcher: boolean }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>season statistics</div>
      <div className={styles.dataTable}>
        {isPitcher && (
          <>
            <DataRow label={"at bats"} data={String(pitcherAtBatsCount(stats))} />
            <DataRow label={"record"} data={pitcherRecord(stats)} />
            <DataRow
              label={"average"}
              data={String(stats.points_data.pitching_data.earned_run_average)}
            />
            <DataRow label={"home runs"} data={String(stats.points_data.pitching_data.home_runs)} />
            <DataRow
              label={"strikeouts"}
              data={String(stats.points_data.pitching_data.strikeouts)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedStat;
