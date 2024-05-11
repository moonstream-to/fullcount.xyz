import { Token } from "../../types";
import styles from "../HomePage/TokenToPlay.module.css";
import Image from "next/image";
import { useQuery } from "react-query";
import HeatMapSmall from "../HomePage/HeatMapSmall";
import { Spinner } from "@chakra-ui/react";
import { fetchPitchDistribution, fetchSwingDistribution } from "../../utils/stats";

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
