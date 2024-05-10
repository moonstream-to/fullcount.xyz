import { PitchLocation, SwingLocation, Token } from "../../types";
import styles from "../HomePage/TokenToPlay.module.css";
import Image from "next/image";
import { useQuery } from "react-query";
import axios from "axios";
import HeatMapSmall from "../HomePage/HeatMapSmall";
import { Spinner } from "@chakra-ui/react";

const TokenCardSmall = ({
  token,
  isPitcher,
  onClick,
  isLoading,
  isForGame,
  showId = true,
}: {
  token: Token | undefined;
  isPitcher: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  isForGame?: boolean;
  showId?: boolean;
}) => {
  const pitchDistributions = useQuery(
    ["pitch_distribution", token?.address, token?.id],
    async () => {
      if (!token || !isPitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      const counts = new Array(25).fill(0);
      try {
        const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        if (!res.data.pitch_distribution) {
          return { counts, rates: counts };
        }
        res.data.pitch_distribution.forEach(
          (l: PitchLocation) => (counts[l.pitch_vertical * 5 + l.pitch_horizontal] = l.count),
        );
        const total = counts.reduce((acc, value) => acc + value);
        const rates = counts.map((value) => value / total);
        return { rates, counts };
      } catch (e) {
        console.log({ token, e });
        return { counts, rates: counts };
      }
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", token?.address, token?.id],
    async () => {
      if (!token || isPitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      const counts = new Array(25).fill(0);
      try {
        const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        let takes = 0;
        if (!res.data.swing_distribution) {
          return { counts, rates: counts, takes: 0 };
        }
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
    },
  );
  if (!token) {
    return <></>;
  }

  if (isForGame) {
    return (
      <div
        className={isPitcher ? styles.containerForPlayPitcher : styles.containerForPlayBatter}
        onClick={onClick}
        id={`token-card-small-${token?.address}-${token?.id}`}
      >
        <Image src={token.image} alt={""} height={"50"} width={"50"} />
        {isPitcher && (
          <div>
            <HeatMapSmall rates={pitchDistributions.data?.rates} size={"10px"} />
          </div>
        )}
        {!isPitcher && (
          <div>
            <HeatMapSmall rates={swingDistributions.data?.rates} size={"10px"} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={onClick || !showId ? styles.container : styles.containerSmall}>
      <Image
        src={token.image}
        alt={""}
        height={onClick || !showId ? "130" : "100"}
        width={onClick || !showId ? "130" : "100"}
      />
      <div className={styles.content}>
        {isPitcher && pitchDistributions.data && (
          <div className={styles.heatMapContainer}>
            <HeatMapSmall rates={pitchDistributions.data.rates} />
          </div>
        )}
        {!isPitcher && swingDistributions.data && (
          <div className={styles.heatMapContainer}>
            <HeatMapSmall rates={swingDistributions.data.rates} />
          </div>
        )}
        <div className={styles.info}>
          <div className={styles.name} title={token.name}>
            {token.name}
          </div>
          {showId && <div className={styles.id}>{token.id}</div>}
        </div>
        {onClick && (
          <div className={styles.button} onClick={onClick}>
            {isLoading ? <Spinner h={4} w={4} /> : isPitcher ? "Bat" : "Pitch"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCardSmall;
