import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../../contexts/GameContext";
import { Session, Token } from "../../types";
import { ReactNode, useEffect } from "react";

const CharacterCard = ({
  token,
  session,
  isClickable = false,
  ...props
}: {
  token: Token | undefined;
  session?: Session;
  isClickable?: boolean;
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
      className={styles.containerSmall}
      {...props}
      w={"fit-content"}
      onClick={() => {
        if (isClickable) {
          handleClick();
        }
      }}
      cursor={isClickable ? "pointer" : "default"}
    >
      <Image h={"40px"} w={"40px"} alt={""} src={token.image} />
      <Flex direction={"column"} fontSize={"14px"}>
        <Text>{token.name}</Text>
        <Text>{`owner ${token.staker?.slice(0, 6)}...${token.staker?.slice(-4)}`}</Text>
      </Flex>
    </Flex>
  );
};

export default CharacterCard;
