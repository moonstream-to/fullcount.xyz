import styles from "./Roster.module.css";
import { OwnedToken } from "../../types";
import { useEffect, useState } from "react";
import Image from "next/image";
import NewCharacterButton from "./NewCharacterButton";
import PlayButtons from "./PlayButtons";
import { useGameContext } from "../../contexts/GameContext";

const Roster = ({ tokens }: { tokens: OwnedToken[] }) => {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const { updateContext } = useGameContext();
  useEffect(() => {
    updateContext({ selectedToken: { ...tokens[selectedTokenIdx] } });
  }, [selectedTokenIdx, tokens]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>roster</div>
      <div className={styles.tokens}>
        <div className={styles.selectedTokenContainer}>
          <Image src={tokens[selectedTokenIdx].image} alt={""} width={"130"} height={"130"} />
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>{tokens[selectedTokenIdx].name}</div>
            <div className={styles.tokenId}>{tokens[selectedTokenIdx].id}</div>
          </div>
          <PlayButtons token={tokens[selectedTokenIdx]} />
        </div>
        <div className={styles.tokenCards}>
          {tokens.map((t, idx) => (
            <Image
              key={idx}
              src={t.image}
              alt={""}
              width={"50"}
              height={"50"}
              className={selectedTokenIdx === idx ? styles.selectedTokenImage : styles.tokenImage}
              onClick={() => setSelectedTokenIdx(idx)}
            />
          ))}
          <NewCharacterButton small={true} />
        </div>
      </div>
    </div>
  );
};

export default Roster;
