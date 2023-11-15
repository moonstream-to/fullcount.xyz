import { useGameContext } from "../../contexts/GameContext";
import { Checkbox, Flex, Text } from "@chakra-ui/react";
import { sessionStates } from "./SessionViewSmall";

const FiltersView = () => {
  const { progressFilter, updateContext } = useGameContext();
  return (
    <Flex justifyContent={"space-between"}>
      <Flex direction={"column"}>
        <Text>Progress: </Text>
        {progressFilter.slice(1).map((progress, idx) => (
          <Checkbox
            key={idx}
            type={"checkbox"}
            isChecked={progress}
            onChange={(e) =>
              updateContext({
                progressFilter: progressFilter.map((progress, index) =>
                  index !== idx + 1 ? progress : e.target.checked,
                ),
              })
            }
          >
            {sessionStates[idx + 1]}
          </Checkbox>
        ))}
      </Flex>
    </Flex>
  );
};

export default FiltersView;
