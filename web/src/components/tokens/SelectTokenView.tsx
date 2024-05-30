import styles from "./SelectTokenView.module.css";
import parentStyles from "./CreateNewCharacter.module.css";
import { OwnedToken } from "../../types";
import TokenCard from "./TokenCard";
import React, { useEffect, useRef, useState } from "react";
import NewCharacterButton from "./NewCharacterButton";
import PvPIcon from "../icons/PvPIcon";
import { useGameContext } from "../../contexts/GameContext";

const getErrorMessage = (sessionProgress: number) => {
  switch (sessionProgress) {
    case 0:
      return "At-bat not found";
    case 2:
      return undefined;
    default:
      return "Invitation is no longer valid";
  }
};

const SelectTokenView = ({
  tokens,
  onClose,
  playRole,
}: {
  tokens: OwnedToken[];
  onClose: (isSuccess: boolean) => void;
  playRole: number;
}) => {
  const { updateContext, isCreateCharacter, selectedToken, atBatToPlay } = useGameContext();

  const elementRef = useRef<HTMLDivElement>(null);
  const [drawBottomLine, setDrawBottomLine] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setDrawBottomLine(element.scrollHeight > element.clientHeight);
    }
  }, [tokens]);

  useEffect(() => {
    if (selectedToken?.isStaked && atBatToPlay) {
      const availableTokenIdx = tokens.findIndex((t) => !t.isStaked);
      if (availableTokenIdx !== -1) {
        updateContext({
          selectedToken: tokens[availableTokenIdx],
          selectedTokenIdx: availableTokenIdx,
        });
      }
    }
  }, [atBatToPlay, selectedToken?.isStaked, tokens]);

  return (
    <>
      {!isCreateCharacter && (
        <div className={styles.container}>
          <div className={styles.headerContainer}>
            <PvPIcon fill={"#262019"} />
            <div className={styles.header}>BATTER UP</div>
          </div>
          <>
            <div
              className={styles.content}
              style={{ borderBottom: drawBottomLine ? "1px solid #7e8e7f" : "none" }}
            >
              <div className={styles.cards} ref={elementRef}>
                {tokens.map((t, idx) => {
                  return !t.isStaked ? (
                    <TokenCard
                      key={idx}
                      token={t}
                      isSelected={t.id === selectedToken?.id}
                      onSelected={() =>
                        updateContext({
                          selectedToken: { ...tokens[idx] },
                          selectedTokenIdx: idx,
                        })
                      }
                    />
                  ) : (
                    <></>
                  );
                })}
                <NewCharacterButton small={false} />
              </div>
            </div>
            <div className={parentStyles.buttonsContainer}>
              <button
                type={"button"}
                className={parentStyles.cancelButton}
                onClick={() => onClose(false)}
              >
                Cancel
              </button>
              <button type={"button"} className={parentStyles.button} onClick={() => onClose(true)}>
                {playRole === 0 ? "Pitch" : "Bat"}
              </button>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default SelectTokenView;
