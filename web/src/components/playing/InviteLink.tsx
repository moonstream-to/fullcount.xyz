import { Flex, Text, useClipboard } from "@chakra-ui/react";
import { Session, Token } from "../../types";
import { LinkIcon } from "@chakra-ui/icons";
import { useGameContext } from "../../contexts/GameContext";
import { getLocalStorageInviteCodeKey, getAppStorageItem } from "../../utils/localStorage";

const InviteLink = ({ session, token }: { session: Session; token: Token }) => {
  const { contractAddress } = useGameContext();
  const inviteCodeKey = getLocalStorageInviteCodeKey(contractAddress, String(session.sessionID));
  const inviteCode = getAppStorageItem(inviteCodeKey);
  const path = `${window.location.href}?session=${session.sessionID}&invitedBy=${encodeURIComponent(
    token.name,
  )}${inviteCode ? "&inviteCode=" : ""}${inviteCode ? inviteCode : ""}`;
  const { onCopy, hasCopied } = useClipboard(path);
  return (
    <Flex direction={"column"} gap={"30px"} alignItems={"center"} mx={"10px"}>
      <Text fontSize={{ base: "12px", lg: "24px" }} fontWeight={"700"}>
        Waiting for Opponent. Invite Friend?
      </Text>
      <Flex gap={"0px"} alignItems={"center"} p={"0px"}>
        <Text
          border="1px solid #4D4D4D"
          borderColor={hasCopied ? "#00A341" : "4D4D4D"}
          background={"#252525"}
          p={"10px"}
          lineHeight={"1"}
          overflowX={"hidden"}
          textOverflow={"ellipsis"}
          whiteSpace={"nowrap"}
          maxW={{ base: "295px", lg: "500px" }}
        >
          {path}
        </Text>
        <LinkIcon
          onClick={onCopy}
          w={"38px"}
          border="1px solid white"
          borderColor={hasCopied ? "#00A341" : "4D4D4D"}
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
