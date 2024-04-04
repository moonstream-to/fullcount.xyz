import { Token } from "../../types";
import styles from "./TokenToPlay.module.css";
import Image from "next/image";
import { Spinner } from "@chakra-ui/react";

const TokenToPlay = ({
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
  if (!token) {
    return <></>;
  }

  if (isForGame) {
    return (
      <div className={isPitcher ? styles.containerForPlayPitcher : styles.containerForPlayBatter}>
        <Image src={token.image} alt={""} height={"50"} width={"50"} />
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

export default TokenToPlay;
