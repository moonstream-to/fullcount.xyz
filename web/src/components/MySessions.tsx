import { Session } from "../types";
import { Flex } from "@chakra-ui/react";
import { useGameContext } from "../contexts/GameContext";
import MySessionView from "./MySessionView";

const MySessions = ({ sessions }: { sessions: Session[] }) => {
  const { updateContext } = useGameContext();
  return (
    <Flex direction={"column"} w={"100%"} gap={"10px"}>
      {sessions.map((session, index) => (
        <MySessionView session={session} key={index} />
      ))}
    </Flex>
  );
};

export default MySessions;
