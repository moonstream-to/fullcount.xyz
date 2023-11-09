import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../contexts/GameContext";
import { Token } from "../types";

const CharacterCard = ({
  token,
  active = true,
  sessionID,
  ...props
}: {
  token: Token;
  active?: boolean;
  sessionID?: number;
  [x: string]: any;
}) => {
  const { updateContext } = useGameContext();
  const handleClick = () => {
    updateContext({ selectedToken: token });
    if (sessionID) {
      updateContext({ sessionId: sessionID });
    }
  };
  return (
    <Flex className={styles.container} {...props} h={active ? "216px" : "fit-content"}>
      <Image h={"137px"} w={"137px"} alt={token.name} src={token.image} />
      <Flex className={styles.bottom}>
        <Text>{token.name}</Text>
        {active && (
          <button className={globalStyles.button} onClick={handleClick}>
            Play
          </button>
        )}
      </Flex>
    </Flex>
  );
};

export default CharacterCard;
