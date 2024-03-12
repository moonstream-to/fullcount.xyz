import styles from "./ChooseToken.module.css";
import parentStyles from "./CreateNewCharacter.module.css";
import { OwnedToken } from "../../types";
import TokenCard from "./TokenCard";
import { useGameContext } from "../../contexts/GameContext";
import { useEffect, useRef, useState } from "react";
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
  const elementRef = useRef<HTMLDivElement>(null);
  const [drawBottomLine, setDrawBottomLine] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setDrawBottomLine(element.scrollHeight > element.clientHeight);
    }
  }, [tokens]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Choose character</div>
      <div
        className={styles.content}
        style={{ borderBottom: drawBottomLine ? "1px solid #7e8e7f" : "none" }}
      >
        <div className={styles.title}>Play</div>
        <div className={styles.prompt}>Choose a character to play with. </div>
        <div className={styles.cards} ref={elementRef}>
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
