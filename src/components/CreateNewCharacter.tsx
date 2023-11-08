import { Flex, Modal, ModalContent, Text, Image } from "@chakra-ui/react";
import styles from "./CreateNewCharacter.module.css";
import { useEffect, useState } from "react";
const NUMBER_OF_IMAGES = 11;

const images: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
images.length = NUMBER_OF_IMAGES;
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSave(name, imageIndex);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className={styles.container} bg="#1A1D22" minW={"fit-content"}>
        <Text className={styles.message}>Create character</Text>
        <input
          type={"text"}
          className={styles.input}
          placeholder={"name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
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
              border={imageIndex === idx ? "2px solid white" : "none"}
            />
          ))}
        </Flex>
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
