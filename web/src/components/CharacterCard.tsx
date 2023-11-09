import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../contexts/GameContext";
import { Token } from "../types";

const CharacterCard = ({
  token,
  active = true,
  sessionID,
}: {
  token: Token;
  active?: boolean;
  sessionID?: number;
}) => {
  const { updateContext } = useGameContext();
  const handleClick = () => {
    updateContext({ selectedToken: token.id });
    if (sessionID) {
      updateContext({ sessionId: sessionID });
    }
  };
  return (
    <Flex className={styles.container}>
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
