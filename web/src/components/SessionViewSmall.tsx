import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import globalStyles from "./OwnedTokens.module.css";
import { Session } from "../types";
import { useGameContext } from "../contexts/GameContext";
import Timer from "./Timer";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";

export const sessionStates = [
  "session does not exist",
  "session aborted",
  "session started, but second player has not yet joined",
  "session started, both players joined, ready for commitments",
  "both players committed, ready for reveals",
  "session complete",
  "session expired",
];

const SessionViewSmall = ({
  session,
  onClick,
}: {
  session: Session;
  onClick: (session: Session) => void;
}) => {
  const { progressFilter } = useGameContext();
  const web3ctx = useContext(Web3Context);
  if (!progressFilter[session.progress]) {
    return <></>;
  }
  return (
    <Flex justifyContent={"space-between"} w={"100%"} alignItems={"center"}>
      <Flex direction={"column"}>
        {`SessionID: ${session.sessionID}`}
        <Text>{sessionStates[session.progress]}</Text>
      </Flex>

      {session.pair.pitcher ? (
        <Flex gap={4}>
          <CharacterCard
            token={session.pair.pitcher}
            isActive={session.pair.pitcher?.staker === web3ctx.account}
            placeSelf={"start"}
            maxW={"70px"}
            maxH={"85px"}
            showName={false}
            session={session}
          />
          <Flex direction={"column"}>
            <Text>Pitcher:</Text>
            <Text>{session.pair.pitcher?.name}</Text>
            <Text>{`TokenID: ${session.pair.pitcher?.id}`}</Text>
            <Text>{`Owner: ${session.pair.pitcher?.staker}`}</Text>
          </Flex>
        </Flex>
      ) : (
        <>
          {session.progress === 2 && (
            <button className={globalStyles.button} onClick={() => onClick(session)}>
              join as pitcher
            </button>
          )}
        </>
      )}
      <Text>vs</Text>
      {session.pair.batter ? (
        <Flex gap={4}>
          <CharacterCard
            token={session.pair.batter}
            isActive={session.pair.batter?.staker === web3ctx.account}
            placeSelf={"start"}
            maxW={"70px"}
            maxH={"85px"}
            showName={false}
            session={session}
          />
          <Flex direction={"column"}>
            <Text>Batter:</Text>
            <Text>{session.pair.batter?.name}</Text>
            <Text>{`TokenID: ${session.pair.batter?.id}`}</Text>
            <Text>{`Owner: ${session.pair.batter?.staker}`}</Text>
          </Flex>
        </Flex>
      ) : (
        <>
          {session.progress === 2 && (
            <button className={globalStyles.button} onClick={() => onClick(session)}>
              join as batter
            </button>
          )}
        </>
      )}
    </Flex>
  );
};

export default SessionViewSmall;
