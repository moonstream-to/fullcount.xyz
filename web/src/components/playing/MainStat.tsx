import styles from "./MainStat.module.css";
import { PlayerStats } from "../../types";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";

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
    stats.points_data.pitching_data.walks +
    stats.points_data.pitching_data.singles +
    stats.points_data.pitching_data.doubles +
    stats.points_data.pitching_data.triples +
    stats.points_data.pitching_data.home_runs;
  return `${wins}-${losses}`;
};

const MainStat = ({ stats, isPitcher }: { stats: PlayerStats; isPitcher: boolean }) => {
  useEffect(() => {
    console.log(stats, isPitcher);
  }, []);
  return (
    <>
      {isPitcher && stats.points_data?.pitching_data && (
        <Flex className={styles.container}>
          <Text className={styles.data}>{pitcherRecord(stats)}</Text>
          <Text className={styles.label}>W-L</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>
            {formatDecimal(stats.points_data.pitching_data.earned_run_average)}
          </Text>
          <Text className={styles.label}>ERA</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>{String(stats.points_data.pitching_data.strikeouts)}</Text>
          <Text className={styles.label}>SO</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>{formatDecimal(stats.points_data.pitching_data.whip)}</Text>
          <Text className={styles.label}>WHIP</Text>
        </Flex>
      )}
      {!isPitcher && stats.points_data?.batting_data && (
        <Flex className={styles.container}>
          <Text className={styles.data}>
            {formatDecimal(stats.points_data.batting_data.batting_average)}
          </Text>
          <Text className={styles.label}>AVG</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>{String(stats.points_data.batting_data.home_runs)}</Text>
          <Text className={styles.label}>HR</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>
            {String(stats.points_data.batting_data.runs_batted_in)}
          </Text>
          <Text className={styles.label}>RBI</Text>
          <Box className={styles.divider} my={"auto"} />
          <Text className={styles.data}>{formatDecimal(stats.points_data.batting_data.ops)}</Text>
          <Text className={styles.label}>OPS</Text>
        </Flex>
      )}
    </>
  );
};

export default MainStat;
