import { Session } from "../types";
import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import globalStyles from "./OwnedTokens.module.css";

const SessionView = ({
  session,
  onClick,
}: {
  session: Session;
  onClick: (session: Session) => void;
}) => {
  return (
    <Flex justifyContent={"space-between"} w={"100%"} alignItems={"center"}>
      {session.pair.pitcher ? (
        <CharacterCard token={session.pair.pitcher} active={false} />
      ) : (
        <button className={globalStyles.button} onClick={() => onClick(session)}>
          join as pitcher
        </button>
      )}
      <Text>vs</Text>
      {session.pair.batter ? (
        <CharacterCard token={session.pair.batter} active={false} />
      ) : (
        <button className={globalStyles.button} onClick={() => onClick(session)}>
          join as batter
        </button>
      )}
    </Flex>
  );
};

export default SessionView;
