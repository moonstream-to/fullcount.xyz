import React from "react";
import styles from "./TokenCard.module.css";
import { Image } from "@chakra-ui/react";
import { PitchLocation, SwingLocation, Token } from "../../types";
import BatIconBig from "../icons/BatIconBig";
import BallIconBig from "../icons/BallIconBig";
import { useQuery } from "react-query";
import axios from "axios";
import MainStat from "../playing/MainStat";
import HeatMap from "../playing/HeatMap";
import DetailedStat from "../playing/DetailedStat";

interface TokenCardProps extends React.RefAttributes<HTMLDivElement> {
  token: Token;
  isPitcher: boolean;
}

const TokenCard: React.FC<TokenCardProps> = React.forwardRef(({ token, isPitcher }, ref) => {
  const pitcherStats = useQuery(
    ["pitcher_stat", token?.address, token?.id],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      try {
        const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        return stat.data;
      } catch (e) {
        console.log({ token, e });
        return 0;
      }
    },
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
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      try {
        const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        return stat.data;
      } catch (e) {
        console.log({ token, e });
        return;
      }
    },
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
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      const counts = new Array(25).fill(0);
      try {
        const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        res.data.pitch_distribution.forEach((l: PitchLocation) => {
          counts[l.pitch_vertical * 5 + l.pitch_horizontal] =
            counts[l.pitch_vertical * 5 + l.pitch_horizontal] + l.count;
        });
        const total = counts.reduce((acc, value) => acc + value);
        const fast = res.data.pitch_distribution.reduce(
          (acc: number, value: { pitch_speed: 0 | 1; count: number }) =>
            acc + (value.pitch_speed === 0 ? value.count : 0),
          0,
        );
        const rates = counts.map((value) => value / total);
        return { rates, counts, fast };
      } catch (e) {
        console.log({ token, e });
        return { counts, rates: counts, fast: 0 };
      }
    },
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
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      const counts = new Array(25).fill(0);
      try {
        const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        let takes = 0;
        res.data.swing_distribution.forEach((l: SwingLocation) =>
          l.swing_type === 2
            ? (takes += l.count)
            : (counts[l.swing_vertical * 5 + l.swing_horizontal] = l.count),
        );
        const total = counts.reduce((acc, value) => acc + value);
        const rates = counts.map((value) => value / total);
        return { rates, counts, takes };
      } catch (e) {
        console.log({ token, e });
        return { counts, rates: counts, takes: 0 };
      }
    },
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
