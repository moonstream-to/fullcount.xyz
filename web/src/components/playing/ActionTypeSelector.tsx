import { Flex } from "@chakra-ui/react";
import styles from "./PlayView.module.css";

const ActionTypeSelector = ({
  types,
  isDisabled,
  selected,
  setSelected,
}: {
  types: string[];
  isDisabled: boolean;
  selected: number;
  setSelected: (value: number) => void;
}) => {
  return (
    <Flex justifyContent={"center"} gap={"20px"}>
      {types.map((type, idx) => (
        <Flex
          key={idx}
          className={selected === idx ? styles.activeChoice : styles.inactiveChoice}
          onClick={isDisabled ? undefined : () => setSelected(idx)}
          cursor={isDisabled ? "default" : "pointer"}
        >
          {type}
        </Flex>
      ))}
    </Flex>
  );
};

export default ActionTypeSelector;
