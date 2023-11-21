import { Flex, Modal, ModalContent, Text, Image } from "@chakra-ui/react";
import styles from "./InviteView.module.css";
import globalStyles from "../GlobalStyles.module.css";
import { useEffect, useState } from "react";
import OwnedTokens from "../tokens/OwnedTokens";
import { useGameContext } from "../../contexts/GameContext";
import { Session, Token } from "../../types";

const InviteView = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { sessions, updateContext, invitedBy, selectedToken, invitedTo, selectedSession } =
    useGameContext();

  return (
    <>
      <Modal isOpen={isOpen || !!selectedSession} onClose={onClose}>
        <ModalContent className={styles.container} bg="#1A" minW={"655px"} my={"auto"}>
          {sessions?.length !== 0 && !sessions?.find((s) => s.sessionID === invitedTo) && (
            <Text>Can&apos;t find the session</Text>
          )}
          {sessions?.find((s) => s.sessionID === invitedTo)?.progress !== 2 && (
            <Text>Invitation is expired</Text>
          )}
          {/*{session?.progress === 2 && (*/}
          {/*  <>*/}
          <Text className={styles.message}>
            Bottom of the ninth. <br />
            Bases loaded. Full count.
          </Text>
          <Text className={globalStyles.gradientText}>Your move</Text>
          <Text
            className={styles.invitationText}
          >{`${invitedBy} is inviting you to play Fullcount.xyz.`}</Text>
          <OwnedTokens forJoin={true} />
          {/*<Flex className={styles.buttons}>*/}
          {/*  <button className={styles.cancelButton} onClick={onClose}>*/}
          {/*    Cancel*/}
          {/*  </button>*/}

          {/*  <button className={styles.saveButton}>Play</button>*/}
          {/*</Flex>*/}
          {/*  </>*/}
          {/*)}*/}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InviteView;
