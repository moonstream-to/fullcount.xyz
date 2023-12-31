import styles from "./MainStat.module.css";
import { PlayerStats } from "../../types";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";

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
    stats.points_data.pitching_data.home_runs;
  return `${wins}-${losses}`;
};

const MainStat = ({ stats, isPitcher }: { stats: PlayerStats; isPitcher: boolean }) => {
  return (
    <>
      {isPitcher && stats.points_data?.pitching_data && (
        <SimpleGrid columns={2} w={"100%"} h={"fit-content"} rowGap={"20px"}>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>{pitcherRecord(stats)}</Text>
            <Text className={styles.label} ml={"0"}>
              W-L
            </Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>
              {formatDecimal(stats.points_data.pitching_data.earned_run_average)}
            </Text>
            <Text className={styles.label}>ERA</Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>
              {String(stats.points_data.pitching_data.strikeouts)}
            </Text>
            <Text className={styles.label}>SO</Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>
              {formatDecimal(stats.points_data.pitching_data.whip)}
            </Text>
            <Text className={styles.label}>WHIP</Text>
          </Flex>
        </SimpleGrid>
      )}
      {!isPitcher && stats.points_data?.batting_data && (
        <SimpleGrid columns={2} w={"100%"} h={"fit-content"} rowGap={"20px"}>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>
              {formatDecimal(stats.points_data.batting_data.batting_average)}
            </Text>
            <Text className={styles.label}>AVG</Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>{String(stats.points_data.batting_data.home_runs)}</Text>
            <Text className={styles.label}>HR</Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>
              {String(stats.points_data.batting_data.runs_batted_in)}
            </Text>
            <Text className={styles.label}>RBI</Text>
          </Flex>
          <Flex alignItems={"end"} gap={"3px"}>
            <Text className={styles.data}>{formatDecimal(stats.points_data.batting_data.ops)}</Text>
            <Text className={styles.label}>OPS</Text>
          </Flex>
        </SimpleGrid>
      )}
    </>
  );
};

export default MainStat;
