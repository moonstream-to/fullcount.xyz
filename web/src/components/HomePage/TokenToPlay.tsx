import { PitchLocation, SwingLocation, Token } from "../../types";
import styles from "./TokenToPlay.module.css";
import Image from "next/image";
import { useQuery } from "react-query";
import axios from "axios";
import HeatMapSmall from "./HeatMapSmall";

const TokenToPlay = ({
  token,
  isPitcher,
  onClick,
}: {
  token: Token;
  isPitcher: boolean;
  onClick?: () => void;
}) => {
  const pitchDistributions = useQuery(
    ["pitch_distribution", token],
    async () => {
      if (!token || !isPitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      try {
        const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
        const counts = new Array(25).fill(0);
        res.data.pitch_distribution.forEach(
          (l: PitchLocation) => (counts[l.pitch_vertical * 5 + l.pitch_horizontal] = l.count),
        );
        const total = counts.reduce((acc, value) => acc + value);
        const rates = counts.map((value) => value / total);
        return { rates, counts };
      } catch (e) {
        console.log({ token, e });
        return;
      }
    },
    {
      enabled: !!token && isPitcher,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", token],
    async () => {
      if (!token || isPitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      try {
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
      } catch (e) {
        console.log({ token, e });
        return;
      }
    },
    {
      enabled: !!token && !isPitcher,
    },
  );
  return (
    <div className={styles.container}>
      <Image
        src={token.image}
        alt={""}
        height={onClick ? "130" : "100"}
        width={onClick ? "130" : "100"}
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
          <div className={styles.name}>{token.name}</div>
          <div className={styles.id}>{token.id}</div>
        </div>
        {onClick && (
          <div className={styles.button} onClick={onClick}>
            Play
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenToPlay;
