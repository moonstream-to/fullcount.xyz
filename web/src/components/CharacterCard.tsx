import { Token } from "./OwnedTokens";
import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../contexts/GameContext";

const CharacterCard = ({ token, active = true }: { token: Token; active?: boolean }) => {
  const { updateContext } = useGameContext();
  return (
    <Flex className={styles.container}>
      <Image h={"137px"} w={"137px"} alt={token.name} src={token.image} />
      <Flex className={styles.bottom}>
        <Text>{token.name}</Text>
        {active && (
          <button
            className={globalStyles.button}
            onClick={() => updateContext({ selectedToken: token.id })}
          >
            Play
          </button>
        )}
      </Flex>
    </Flex>
  );
};

export default CharacterCard;
