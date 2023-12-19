import { Modal, ModalContent, Text } from "@chakra-ui/react";
import styles from "./InviteView.module.css";
import globalStyles from "../GlobalStyles.module.css";
import OwnedTokens from "../tokens/OwnedTokens";
import { useGameContext } from "../../contexts/GameContext";

const InviteView = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { sessions, invitedBy, invitedTo, selectedSession } = useGameContext();

  return (
    <>
      <Modal isOpen={isOpen || !!selectedSession} onClose={onClose}>
        <ModalContent
          className={styles.container}
          bg="#1A"
          minW={{ base: "", lg: "662px" }}
          my={"auto"}
        >
          {sessions &&
            sessions?.length !== 0 &&
            !sessions?.find((s) => s.sessionID === invitedTo) && (
              <Text>Can&apos;t find the session</Text>
            )}
          {sessions && sessions?.find((s) => s.sessionID === invitedTo)?.progress !== 2 && (
            <Text>Invitation is expired</Text>
          )}
          <Text className={styles.message}>
            Bottom of the ninth. <br />
            Bases loaded. Full count.
          </Text>
          <Text className={globalStyles.gradientText}>Your move</Text>
          <Text
            className={styles.invitationText}
          >{`${invitedBy} is inviting you to play Fullcount.xyz.`}</Text>
          <OwnedTokens forJoin={true} />
        </ModalContent>
      </Modal>
    </>
  );
};

export default InviteView;
