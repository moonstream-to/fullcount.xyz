import { Modal, ModalOverlay, ModalContent, Image, Flex, Text, Box } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import styles from "./About.module.css";

interface ModalExampleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SoundCreditsProps {
  soundCredits: {
    sound: string;
    soundRef: string;
    author: string;
    authorRef: string;
    licence: string;
  }[];
}
const SoundCredits: React.FC<SoundCreditsProps> = ({ soundCredits }) => {
  return (
    <Flex gap={"10px"} direction={"column"}>
      {soundCredits.map((credit, index) => (
        <Box key={index} className={styles.text}>
          <a href={credit.soundRef} target="_blank" rel="noopener noreferrer">
            {credit.sound}
          </a>{" "}
          by{" "}
          <a href={credit.authorRef} target="_blank" rel="noopener noreferrer">
            {credit.author}
          </a>{" "}
          licensed under {credit.licence}
        </Box>
      ))}
    </Flex>
  );
};

const soundCredits = [
  {
    sound: "baseball-hit-01",
    soundRef: "https://freesound.org/people/Eelke/sounds/266642",
    author: "Eelke",
    authorRef: "https://freesound.org/people/Eelke/",
    licence: "CC BY 4.0",
  },
  {
    sound: "Glove Catch 6 FF009",
    soundRef: "https://freesound.org/people/martinimeniscus/sounds/164530/",
    author: "martinimeniscus",
    authorRef: "https://freesound.org/people/martinimeniscus/",
    licence: "CC0 1.0",
  },
];

const ModalExample: React.FC<ModalExampleProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} motionPreset="scale" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <Flex className={styles.container} maxW={"600px"}>
            <Image alt={"logo"} src={`${FULLCOUNT_ASSETS_PATH}/fullcount-logo.svg`} h={"20px"} />
            <Flex className={styles.header}>
              <Text className={styles.subtitle}>Created and powered by</Text>
              <Image
                alt={"logo"}
                src={`${FULLCOUNT_ASSETS_PATH}/moonstream-logo-v1.svg`}
                h={"19px"}
                w={"132px"}
              />
            </Flex>
            <Flex gap={"15px"} direction={"column"} alignItems={"center"}>
              <Text className={styles.subtitle}>Sounds</Text>
              <Text className={styles.text}>This game uses these sounds from freesound:</Text>
              <SoundCredits soundCredits={soundCredits} />
            </Flex>
            <button className={styles.button} onClick={onClose}>
              Close
            </button>
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalExample;
