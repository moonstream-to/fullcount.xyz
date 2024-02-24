import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../../contexts/GameContext";
import { OwnedToken, Session } from "../../types";
import React, { ReactNode } from "react";

const playSound = () => {
  const sound = document.getElementById("selectSound") as HTMLAudioElement;
  if (!sound) {
    return;
  }
  sound.play();
};
const soundSrc = "sounds/select.wav";

const CharacterCard = ({
  token,
  isActive = true,
  session,
  isClickable = false,
  showName = true,
  children,
  ...props
}: {
  token: OwnedToken | undefined;
  isActive?: boolean;
  session?: Session;
  isClickable?: boolean;
  showName?: boolean;
  children?: ReactNode;
  [x: string]: any;
}) => {
  const { updateContext } = useGameContext();
  const handleClick = () => {
    playSound();
    updateContext({ selectedToken: token });
    if (session) {
      updateContext({ selectedSession: session });
    }
  };

  if (!token) {
    return <></>;
  }

  return (
    <Flex
      className={styles.container}
      h={isActive || children ? "216px" : "fit-content"}
      w={"fit-content"}
      {...props}
      onClick={() => {
        if (isClickable) {
          handleClick();
        }
      }}
      cursor={isClickable ? "pointer" : "default"}
    >
      {token.highestRank && (
        <>
          <div className={styles.rankBackground} />
          <div className={styles.rank}>
            <div className={styles.rankText}> {token.highestRank}</div>
          </div>
        </>
      )}
      <Image
        h={{ base: "137px", lg: "137px" }}
        w={{ base: "137px", lg: "137px" }}
        alt={""}
        src={token.image}
      />
      {(showName || isActive || children) && (
        <Flex className={styles.bottom}>
          {showName && <Text maxW={{ base: "137px", lg: "137px" }}>{token.name}</Text>}
          {isActive && (
            <button className={globalStyles.button} onClick={handleClick}>
              Play
            </button>
          )}
          {children}
        </Flex>
      )}
    </Flex>
  );
};

export default CharacterCard;
