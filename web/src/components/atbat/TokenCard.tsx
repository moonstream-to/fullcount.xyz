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

const TokenCard = ({ token, isPitcher }: { token: Token; isPitcher: boolean }) => {
  const pitcherStats = useQuery(
    ["pitcher_stat", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      console.log(stat.data);
      return stat.data;
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const batterStats = useQuery(
    ["batter_stat", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      console.log(stat.data);
      return stat.data;
    },
    {
      enabled: !!token && !isPitcher,
    },
  );

  const pitchDistributions = useQuery(
    ["pitch_distribution", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      const counts = new Array(25).fill(0);
      res.data.pitch_distribution.forEach(
        (l: PitchLocation) => (counts[l.pitch_vertical * 5 + l.pitch_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const fast = res.data.pitch_distribution.reduce(
        (acc: number, value: { pitch_speed: 0 | 1; count: number }) =>
          acc + (value.pitch_speed === 0 ? value.count : 0),
        0,
      );
      const rates = counts.map((value) => value / total);
      return { rates, counts, fast };
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", token],
    async () => {
      if (!token) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
      const counts = new Array(25).fill(0);
      let takes = 0;
      res.data.swing_distribution.forEach((l: SwingLocation) =>
        l.swing_type === 2
          ? (takes += l.count)
          : (counts[l.swing_vertical * 5 + l.swing_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const rates = counts.map((value) => value / total);
      return { rates, counts, takes };
    },
    {
      enabled: !!token && !isPitcher,
    },
  );
  return (
    <div className={isPitcher ? styles.pitcherContainer : styles.batterContainer}>
      <Image className={styles.image} alt={""} src={token.image} />
      <div className={styles.tokenInfo}>
        {isPitcher ? (
          <BatIconBig width={"31"} height={"31"} viewBox={"0 0 31 30"} />
        ) : (
          <BallIconBig width={"31"} height={"31"} viewBox={"0 0 31 30"} />
        )}
        <div className={styles.tokenName}>{token.name}</div>
        <div className={styles.tokenId}>{token.id}</div>
      </div>
      {((isPitcher && pitcherStats.data) || (!isPitcher && batterStats.data)) && (
        <MainStat stats={isPitcher ? pitcherStats.data : batterStats.data} isPitcher={isPitcher} />
      )}
      <div className={styles.detailedStat}>
        {isPitcher && pitchDistributions.data && (
          <HeatMap
            fast={pitchDistributions.data.fast}
            rates={pitchDistributions.data.rates}
            counts={pitchDistributions.data.counts}
            isPitcher
          />
        )}
        {!isPitcher && swingDistributions.data && (
          <HeatMap
            takes={swingDistributions.data.takes}
            rates={swingDistributions.data.rates}
            counts={swingDistributions.data.counts}
            isPitcher={false}
          />
        )}
        {((isPitcher && pitcherStats.data) || (!isPitcher && batterStats.data)) && (
          <DetailedStat
            stats={isPitcher ? pitcherStats.data : batterStats.data}
            isPitcher={isPitcher}
          />
        )}
      </div>
    </div>
  );
};

export default TokenCard;
