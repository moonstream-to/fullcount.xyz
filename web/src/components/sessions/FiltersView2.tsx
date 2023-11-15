import { useGameContext } from "../../contexts/GameContext";
import { Flex } from "@chakra-ui/react";
import styles from "./FiltersView.module.css";

const FiltersView2 = () => {
  const { progressFilter, updateContext } = useGameContext();
  return (
    <Flex className={styles.container}>
      <Flex
        className={progressFilter.includes(false) ? styles.notSelected : styles.selected}
        onClick={() => updateContext({ progressFilter: progressFilter.map(() => true) })}
      >
        All
      </Flex>
      <Flex
        className={progressFilter[2] && !progressFilter[3] ? styles.selected : styles.notSelected}
        onClick={() => updateContext({ progressFilter: progressFilter.map((_, idx) => idx === 2) })}
      >
        Open
      </Flex>
      <Flex
        className={
          (progressFilter[3] || progressFilter[4]) && !progressFilter[2]
            ? styles.selected
            : styles.notSelected
        }
        onClick={() =>
          updateContext({ progressFilter: progressFilter.map((_, idx) => idx === 3 || idx === 4) })
        }
      >
        In progress
      </Flex>
      <Flex
        className={progressFilter[6] && !progressFilter[2] ? styles.selected : styles.notSelected}
        onClick={() =>
          updateContext({
            progressFilter: progressFilter.map(
              (_, idx) => idx === 0 || idx === 1 || idx === 5 || idx === 6,
            ),
          })
        }
      >
        Others
      </Flex>
    </Flex>
  );
};

export default FiltersView2;
