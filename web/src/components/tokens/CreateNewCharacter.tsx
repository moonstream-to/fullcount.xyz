import { Flex, Modal, ModalContent, Text, Image } from "@chakra-ui/react";
import styles from "./CreateNewCharacter.module.css";
import { useEffect, useState } from "react";
const NUMBER_OF_IMAGES = 24;

const images: number[] = [];
for (let i = 0; i < NUMBER_OF_IMAGES; i += 1) {
  images.push(i);
}

const CreateNewCharacter = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, imageIndex: number) => void;
}) => {
  const [name, setName] = useState("");
  const [imageIndex, setImageIndex] = useState(-1);

  useEffect(() => {
    setName("");
    setImageIndex(-1);
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSave(name, imageIndex);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className={styles.container} bg="#1A1D22" minW={"782px"}>
        <Text className={styles.message}>Create character</Text>
        <Flex wrap={"wrap"} gap={"20px"} maxW={"800px"} placeSelf={"center"}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              h="100px"
              w="100px"
              alt={`img${idx}`}
              src={`https://badges.moonstream.to/blb/p${idx}.png`}
              cursor={"pointer"}
              onClick={() => setImageIndex(idx)}
              border={imageIndex === idx ? "2px solid white" : "1px solid #4D4D4D"}
            />
          ))}
        </Flex>
        <Text className={styles.text} mt={"-30px"}>
          Select an image for your NFT
        </Text>

        <input
          type={"text"}
          className={styles.input}
          placeholder={"Enter name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Flex className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={!name || imageIndex === -1}
            className={styles.saveButton}
            onClick={() => onSave(name, imageIndex)}
          >
            Create
          </button>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default CreateNewCharacter;
