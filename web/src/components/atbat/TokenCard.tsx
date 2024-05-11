import React from "react";
import styles from "./TokenCard.module.css";
import { Image } from "@chakra-ui/react";
import { Token } from "../../types";
import BatIconBig from "../icons/BatIconBig";
import BallIconBig from "../icons/BallIconBig";
import { useQuery } from "react-query";
import MainStat from "../playing/MainStat";
import HeatMap from "../playing/HeatMap";
import DetailedStat from "../playing/DetailedStat";
import {
  fetchBatterStats,
  fetchPitchDistribution,
  fetchPitcherStats,
  fetchSwingDistribution,
} from "../../utils/stats";

interface TokenCardProps extends React.RefAttributes<HTMLDivElement> {
  token: Token;
  isPitcher: boolean;
}

const TokenCard: React.FC<TokenCardProps> = React.forwardRef(({ token, isPitcher }, ref) => {
  const pitcherStats = useQuery(
    ["pitcher_stat", token?.address, token?.id],
    () => fetchPitcherStats(token),
    {
      enabled: !!token && isPitcher,
      retryDelay: (attemptIndex) => (attemptIndex < 1 ? 5000 : 10000),
      retry: (failureCount) => {
        return failureCount < 3;
      },
      refetchInterval: 50000,
    },
  );

  const batterStats = useQuery(
    ["batter_stat", token?.address, token?.id],
    () => fetchBatterStats(token),
    {
      enabled: !!token && !isPitcher,
      retryDelay: (attemptIndex) => (attemptIndex < 1 ? 5000 : 10000),
      retry: (failureCount) => {
        return failureCount < 3;
      },
      refetchInterval: 50000,
    },
  );

  const pitchDistributions = useQuery(
    ["pitch_distribution", token?.address, token?.id],
    () => fetchPitchDistribution(token),
    {
      enabled: !!token && isPitcher,
      retryDelay: (attemptIndex) => (attemptIndex < 1 ? 5000 : 10000),
      retry: (failureCount) => {
        return failureCount < 3;
      },
      refetchInterval: 50000,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", token?.address, token?.id],
    () => fetchSwingDistribution(token),
    {
      enabled: !!token && !isPitcher,
      retryDelay: (attemptIndex) => (attemptIndex < 1 ? 5000 : 10000),
      retry: (failureCount) => {
        return failureCount < 3;
      },
      refetchInterval: 50000,
    },
  );

  return (
    <div className={isPitcher ? styles.pitcherContainer : styles.batterContainer} ref={ref}>
      <div className={styles.imageAndInfo}>
        <Image className={styles.image} alt={""} src={token.image} />
        <div className={styles.tokenInfo}>
          {!isPitcher ? (
            <BatIconBig width={"31"} height={"31"} viewBox={"0 0 31 30"} className={styles.icon} />
          ) : (
            <BallIconBig width={"31"} height={"31"} viewBox={"0 0 31 30"} className={styles.icon} />
          )}
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenId}>{token.id}</div>
        </div>
      </div>
      <MainStat stats={isPitcher ? pitcherStats.data : batterStats.data} isPitcher={isPitcher} />
      <div className={styles.detailedStat}>
        <div style={{ minWidth: "130px" }}>
          {isPitcher && (
            <HeatMap
              fast={pitchDistributions.data?.fast}
              rates={pitchDistributions.data?.rates}
              counts={pitchDistributions.data?.counts}
              isPitcher
            />
          )}
          {!isPitcher && (
            <HeatMap
              takes={swingDistributions.data?.takes}
              rates={swingDistributions.data?.rates}
              counts={swingDistributions.data?.counts}
              isPitcher={false}
            />
          )}
        </div>
        {((isPitcher && pitcherStats.data) || (!isPitcher && batterStats.data)) && (
          <DetailedStat
            stats={isPitcher ? pitcherStats.data : batterStats.data}
            isPitcher={isPitcher}
          />
        )}
      </div>
    </div>
  );
});

TokenCard.displayName = "TokenCard";

export default TokenCard;
