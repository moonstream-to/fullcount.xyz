import styles from "./ChooseToken.module.css";
import parentStyles from "./CreateNewCharacter.module.css";
import { OwnedToken } from "../../types";
import TokenCard from "./TokenCard";
import { useGameContext } from "../../contexts/GameContext";
import { useState } from "react";
import NewCharacterButton from "./NewCharacterButton";

const ChooseToken = ({
  tokens,
  onChoose,
  onClose,
}: {
  tokens: OwnedToken[];
  onChoose: (token: OwnedToken) => void;
  onClose: () => void;
}) => {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  return (
    <div className={styles.container}>
      <div className={styles.header}>Choose character</div>
      <div className={styles.content}>
        <div className={styles.title}>Play</div>
        <div className={styles.prompt}>Choose a character to play with. </div>
        <div className={styles.cards} style={{ position: "relative" }}>
          {tokens.map((t, idx) => (
            <TokenCard
              key={idx}
              token={t}
              isSelected={idx === selectedTokenIdx}
              onSelected={() => setSelectedTokenIdx(idx)}
            />
          ))}
          <NewCharacterButton small={false} />
        </div>
      </div>
      <div className={parentStyles.buttonsContainer}>
        <div className={parentStyles.cancelButton} onClick={onClose}>
          Cancel
        </div>
        <div className={parentStyles.button} onClick={() => onChoose(tokens[selectedTokenIdx])}>
          Play
        </div>
      </div>
    </div>
  );
};

export default ChooseToken;
