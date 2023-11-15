import { Flex, Text, useClipboard } from "@chakra-ui/react";
import { Session } from "../../types";
import { LinkIcon } from "@chakra-ui/icons";

const InviteLink = ({ session }: { session: Session }) => {
  const { onCopy } = useClipboard(`fullcount.xyz/?session=${session.sessionID}&invite=true`);
  return (
    <Flex direction={"column"} gap={"30px"} alignItems={"center"}>
      <Text fontSize={"24px"} fontWeight={"700"}>
        Waiting for Opponent. Invite Friend?
      </Text>
      <Flex gap={"0px"} alignItems={"center"} p={"0px"}>
        <Text
          border="1px solid #4D4D4D"
          background={"#252525"}
          p={"10px"}
          lineHeight={"1"}
        >{`fullcount.xyz/?session=${session.sessionID}&invite=true`}</Text>
        <LinkIcon
          onClick={onCopy}
          w={"38px"}
          border="1px solid white"
          h={"38px"}
          p={"10px"}
          bg={"#00A341"}
          cursor={"pointer"}
        />
      </Flex>
    </Flex>
  );
};

export default InviteLink;
