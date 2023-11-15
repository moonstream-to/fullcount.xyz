import { Box, Flex, Image, Text } from "@chakra-ui/react";
import styles from "./CharacterCard.module.css";
import { useGameContext } from "../../contexts/GameContext";
import { Session, Token } from "../../types";

const CharacterCard = ({
  token,
  session,
  isClickable = false,
  isOwned,
  ...props
}: {
  token: Token | undefined;
  session?: Session;
  isClickable?: boolean;
  isOwned: boolean;
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
      {isOwned && <Box w={"3px"} h={"48px"} bg={"white"} mr={"-6px"} />}
      <Image h={"40px"} w={"40px"} alt={""} src={token.image} border="1px solid #4D4D4D" />
      <Flex direction={"column"} fontSize={"14px"}>
        <Text>{token.name}</Text>
        <Text>{`owner ${token.staker?.slice(0, 6)}...${token.staker?.slice(-4)}`}</Text>
      </Flex>
    </Flex>
  );
};

export default CharacterCard;
