import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../../contexts/GameContext";
import { Session, Token } from "../../types";
import { ReactNode, useEffect } from "react";

const CharacterCard = ({
  token,
  isActive = true,
  session,
  isClickable = false,
  showName = true,
  children,
  ...props
}: {
  token: Token | undefined;
  isActive?: boolean;
  session?: Session;
  isClickable?: boolean;
  showName?: boolean;
  children?: ReactNode;
  [x: string]: any;
}) => {
  const { updateContext } = useGameContext();
  const handleClick = () => {
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
      {...props}
      h={isActive || children ? "216px" : "fit-content"}
      w={"fit-content"}
      onClick={() => {
        if (isClickable) {
          handleClick();
        }
      }}
      cursor={isClickable ? "pointer" : "default"}
    >
      <Image h={"137px"} w={"137px"} alt={""} src={token.image} />
      {(showName || isActive || children) && (
        <Flex className={styles.bottom}>
          {showName && <Text>{token.name}</Text>}
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
