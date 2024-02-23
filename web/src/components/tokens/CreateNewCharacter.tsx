import { Flex, Modal, ModalContent, Text, Image } from "@chakra-ui/react";
import styles from "./CreateNewCharacter.module.css";
import { useEffect, useState } from "react";
import { TokenSource } from "../../types";
import useUser from "../../contexts/UserContext";
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
  onSave: (name: string, imageIndex: number, source: TokenSource) => void;
}) => {
  const [name, setName] = useState("");
  const [imageIndex, setImageIndex] = useState(-1);
  const [source, setSource] = useState<TokenSource>("FullcountPlayerAPI");
  const { user } = useUser();

  useEffect(() => {
    setName("");
    setImageIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    if (!user) {
      setSource("BLBContract");
    } else {
      setSource("FullcountPlayerAPI");
    }
  }, [user]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSave(name, imageIndex, source);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className={styles.container} bg="#1A1D22" minW={{ base: "", lg: "782px" }}>
        <Text className={styles.message}>Create character</Text>
        {user && (
          <Flex gap={"15px"}>
            <Flex
              onClick={() => setSource("FullcountPlayerAPI")}
              p={"5px 40px"}
              cursor={"pointer"}
              border={`1px solid ${source === "FullcountPlayerAPI" ? "white" : "#333"}`}
              color={`${source === "FullcountPlayerAPI" ? "white" : "#888"}`}
            >
              Fullcount Player
            </Flex>
            <Flex
              onClick={() => setSource("BLBContract")}
              p={"5px 40px"}
              cursor={"pointer"}
              border={`1px solid ${source === "BLBContract" ? "white" : "#333"}`}
              color={`${source === "BLBContract" ? "white" : "#888"}`}
            >
              BLB token
            </Flex>
          </Flex>
        )}
        <Flex wrap={"wrap"} gap={"20px"} maxW={"800px"} placeSelf={"center"}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              h={{ base: "40px", lg: "100px" }}
              w={{ base: "40px", lg: "100px" }}
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
            onClick={() => onSave(name, imageIndex, source)}
          >
            Create
          </button>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default CreateNewCharacter;
