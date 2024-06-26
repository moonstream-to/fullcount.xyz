import styles from "./DetailedStat.module.css";
import { PlayerStats } from "../../types";
import AnimatedMessage from "../AnimatedMessage";
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

const batterRecord = (stats: PlayerStats): string => {
  const losses =
    stats.points_data.batting_data.strikeouts + stats.points_data.batting_data.in_play_outs;
  const wins =
    stats.points_data.batting_data.singles +
    stats.points_data.batting_data.doubles +
    stats.points_data.batting_data.triples +
    stats.points_data.batting_data.home_runs +
    stats.points_data.batting_data.walks;
  return `${wins}-${losses}`;
};

const hits = (stats: PlayerStats): string => {
  return String(
    stats.points_data.pitching_data.singles +
      stats.points_data.pitching_data.doubles +
      stats.points_data.pitching_data.triples +
      stats.points_data.pitching_data.home_runs,
  );
};

const pitcherAtBatsCount = (stats: PlayerStats): number => {
  return (
    stats.points_data.pitching_data.singles +
    stats.points_data.pitching_data.doubles +
    stats.points_data.pitching_data.triples +
    stats.points_data.pitching_data.home_runs +
    stats.points_data.pitching_data.strikeouts +
    stats.points_data.pitching_data.in_play_outs
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

const DetailedStat = ({
  stats,
  isPitcher,
}: {
  stats: PlayerStats | undefined;
  isPitcher: boolean;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {stats !== undefined ? "season statistics" : <AnimatedMessage message={"loading"} />}
      </div>
      <div className={styles.dataTable}>
        {isPitcher && stats?.points_data.pitching_data && (
          <>
            <DataRow label={"at bats"} data={String(pitcherAtBatsCount(stats))} />
            <DataRow label={"record"} data={pitcherRecord(stats)} />
            <DataRow
              label={"era"}
              data={formatDecimal(stats.points_data.pitching_data.earned_run_average)}
            />
            <DataRow label={"whip"} data={formatDecimal(stats.points_data.pitching_data.whip)} />
            <DataRow
              label={"strikeouts"}
              data={String(stats.points_data.pitching_data.strikeouts)}
            />
            <DataRow label={"walks"} data={String(stats.points_data.pitching_data.walks)} />
            <DataRow label={"Hits Allowed"} data={hits(stats)} />
            <DataRow
              label={"HR Allowed"}
              data={String(stats.points_data.pitching_data.home_runs)}
            />
          </>
        )}
        {!isPitcher && stats?.points_data.batting_data && (
          <>
            <DataRow label={"at bats"} data={String(stats.points_data.batting_data.at_bats)} />
            <DataRow label={"record"} data={batterRecord(stats)} />
            <DataRow
              label={"Average"}
              data={formatDecimal(stats.points_data.batting_data.batting_average)}
            />
            <DataRow
              label={"On-Base %"}
              data={String((stats.points_data.batting_data.on_base * 100).toFixed(2))}
            />
            <DataRow label={"Home Runs"} data={String(stats.points_data.batting_data.home_runs)} />
            <DataRow
              label={"Strikeouts"}
              data={String(stats.points_data.batting_data.strikeouts)}
            />
            <DataRow label={"OPS"} data={formatDecimal(stats.points_data.batting_data.ops)} />
            <DataRow label={"Walks"} data={String(stats.points_data.batting_data.walks)} />
          </>
        )}
        {isPitcher && !stats?.points_data.pitching_data && (
          <>
            <DataRow label={"at bats"} data={"-"} />
            <DataRow label={"record"} data={"-"} />
            <DataRow label={"era"} data={"-"} />
            <DataRow label={"whip"} data={"-"} />
            <DataRow label={"strikeouts"} data={"-"} />
            <DataRow label={"walks"} data={"-"} />
            <DataRow label={"Hits Allowed"} data={"-"} />
            <DataRow label={"HR Allowed"} data={"-"} />
          </>
        )}
        {!isPitcher && !stats?.points_data.batting_data && (
          <>
            <DataRow label={"at bats"} data={"-"} />
            <DataRow label={"record"} data={"-"} />
            <DataRow label={"Average"} data={"-"} />
            <DataRow label={"On-Base %"} data={"-"} />
            <DataRow label={"Home Runs"} data={"-"} />
            <DataRow label={"Strikeouts"} data={"-"} />
            <DataRow label={"OPS"} data={"-"} />
            <DataRow label={"Walks"} data={"-"} />
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedStat;
