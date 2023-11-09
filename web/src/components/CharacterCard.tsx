import { Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useGameContext } from "../contexts/GameContext";
import { Session, Token } from "../types";

const CharacterCard = ({
  token,
  active = true,
  session,
  ...props
}: {
  token: Token;
  active?: boolean;
  session?: Session;
  [x: string]: any;
}) => {
  const { updateContext } = useGameContext();
  const handleClick = () => {
    updateContext({ selectedToken: token });
    if (session) {
      updateContext({ selectedSession: session });
    }
  };
  return (
    <Flex
      className={styles.container}
      {...props}
      h={active ? "216px" : "fit-content"}
      w={"fit-content"}
    >
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
