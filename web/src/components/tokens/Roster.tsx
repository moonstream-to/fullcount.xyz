import styles from "./Roster.module.css";
import { OwnedToken } from "../../types";
import { useEffect, useState } from "react";
import { Image } from "@chakra-ui/react";
import NewCharacterButton from "./NewCharacterButton";
import PlayButtons from "./PlayButtons";
import { useGameContext } from "../../contexts/GameContext";

const Roster = ({ tokens }: { tokens: OwnedToken[] }) => {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const { updateContext, selectedMode, selectedToken } = useGameContext();
  useEffect(() => {
    updateContext({ selectedToken: { ...tokens[selectedTokenIdx] } });
  }, [selectedTokenIdx, tokens]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>roster</div>
      <div className={styles.tokens}>
        <div className={styles.selectedTokenContainer}>
          <Image src={tokens[selectedTokenIdx].image} alt={""} className={styles.bigTokenImage} />
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>{tokens[selectedTokenIdx].name}</div>
            <div className={styles.tokenId}>{tokens[selectedTokenIdx].id}</div>
          </div>
          {selectedMode === 0 && <PlayButtons token={tokens[selectedTokenIdx]} />}
        </div>
        <div className={styles.tokenCards}>
          {tokens.map((t, idx) => (
            <Image
              key={idx}
              src={t.image}
              fallback={<div className={styles.tokenImageFallback} />}
              alt={""}
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
