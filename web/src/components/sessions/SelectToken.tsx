import { OwnedToken } from "../../types";
import { Modal, ModalContent, Text } from "@chakra-ui/react";
import styles from "./InviteView.module.css";
import globalStyles from "../GlobalStyles.module.css";
import OwnedTokens from "../tokens/OwnedTokens";

const SelectToken = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent
          className={styles.container}
          bg="#1A"
          minW={{ base: "", lg: "662px" }}
          my={"auto"}
        >
          <Text className={styles.message}>
            Bottom of the ninth. <br />
            Bases loaded. Full count.
          </Text>
          <Text className={globalStyles.gradientText}>Your move</Text>
          <Text className={styles.invitationText}>{`Select character`}</Text>
          {/*<OwnedTokens forJoin={true} />*/}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SelectToken;
