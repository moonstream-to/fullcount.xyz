import { Session } from "../types";
import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import globalStyles from "./OwnedTokens.module.css";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";

const MySessionView = ({ session }: { session: Session }) => {
  const web3ctx = useContext(Web3Context);

  const handleInvite = () => {
    console.log(session.sessionID);
  };
  return (
    <Flex justifyContent={"space-between"} w={"100%"} alignItems={"center"}>
      {session.pair.pitcher ? (
        <CharacterCard
          token={session.pair.pitcher}
          active={session.pair.pitcher.staker === web3ctx.account}
        />
      ) : (
        <button className={globalStyles.button} onClick={handleInvite}>
          invite
        </button>
      )}
      <Text>vs</Text>
      {session.pair.batter ? (
        <CharacterCard
          token={session.pair.batter}
          active={session.pair.batter.staker === web3ctx.account}
        />
      ) : (
        <button className={globalStyles.button} onClick={handleInvite}>
          invite
        </button>
      )}
    </Flex>
  );
};

export default MySessionView;
