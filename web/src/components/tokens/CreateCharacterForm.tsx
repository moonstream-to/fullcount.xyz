import { Flex, Spinner } from "@chakra-ui/react";
import Image from "next/image";

import styles from "./CreateNewCharacter.module.css";
import React, { useEffect, useState } from "react";
import { TokenSource } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import { mintFullcountPlayerToken } from "../../tokenInterfaces/FullcountPlayerAPI";
import useMoonToast from "../../hooks/useMoonToast";
import { blbImage, NUMBER_OF_BLB_IMAGES } from "../../constants";
import { sendReport } from "../../utils/humbug";
import { useSound } from "../../hooks/useSound";

const images: number[] = [];
for (let i = 0; i < NUMBER_OF_BLB_IMAGES; i += 1) {
  images.push(i);
}

const CreateCharacterForm = ({ onClose }: { onClose?: () => void }) => {
  const [name, setName] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const source: TokenSource = "FullcountPlayerAPI";
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const playSound = useSound();

  const mintToken = useMutation(
    async ({ name, imageIndex, source }: { name: string; imageIndex: number; source: string }) => {
      switch (source) {
        case "FullcountPlayerAPI":
          return mintFullcountPlayerToken({ name, imageIndex });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${source}`));
      }
    },
    {
      onSuccess: () => {
        if (onClose) {
          onClose();
        }
        queryClient.invalidateQueries("owned_tokens"); //TODO data update
      },
      onError: (e: Error) => {
        console.log(e);
        toast("Minting failed: " + e?.message, "error");
        sendReport("Error toast", { error: e }, ["type:error_toast"]);
      },
    },
  );

  useEffect(() => {
    setName("");
    setImageIndex(0);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      mintToken.mutate({ name, imageIndex, source });
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>Create character</div>

      <div className={styles.content}>
        <Image width={"161"} height={"161"} src={blbImage(imageIndex)} alt={""} />
        <div className={styles.images}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              width={"50"}
              height={"50"}
              alt={`img${idx}`}
              src={blbImage(idx)}
              className={imageIndex === idx ? styles.selectedImage : styles.image}
              onClick={() => {
                playSound("imageSelector");
                setImageIndex(idx);
              }}
            />
          ))}
        </div>
        <div className={styles.hint}>Choose an image.</div>
        <label className={styles.label}>Name</label>
        <input
          type={"text"}
          id={"name"}
          placeholder={"Enter name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>
      <div className={styles.buttonsContainer}>
        {onClose && (
          <button
            className={styles.cancelButton}
            onClick={() => {
              playSound("cancelButton");
              onClose();
            }}
          >
            Cancel
          </button>
        )}
        <button
          disabled={!name || imageIndex === -1}
          className={!name || imageIndex === -1 ? styles.inactiveButton : styles.button}
          onClick={() => {
            playSound("createButton");
            mintToken.mutate({ name, imageIndex, source });
          }}
        >
          {mintToken.isLoading ? (
            <Spinner h={4} w={4} />
          ) : mintToken.isSuccess ? (
            <div>Success</div>
          ) : (
            <div>Create</div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateCharacterForm;
