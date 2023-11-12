import { Session } from "../types";
import { Flex } from "@chakra-ui/react";
import { useGameContext } from "../contexts/GameContext";
import MySessionView from "./MySessionView";
import SessionViewSmall from "./SessionViewSmall";
import SessionView from "./SessionView";

const MySessions = ({
  sessions,
  onClick,
}: {
  sessions: Session[];
  onClick: (session: Session) => void;
}) => {
  const { updateContext } = useGameContext();
  return (
    <Flex direction={"column"} w={"100%"} gap={"10px"}>
      {sessions.map((session, index) => (
        <SessionViewSmall session={session} key={index} onClick={onClick} />
      ))}
    </Flex>
  );
};

export default MySessions;
