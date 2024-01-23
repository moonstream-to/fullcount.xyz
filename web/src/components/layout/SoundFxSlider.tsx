import {
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { useGameContext } from "../../contexts/GameContext";

const SoundFxSlider = () => {
  const { soundVolume, updateContext } = useGameContext();
  const [isMobile] = useMediaQuery(["(max-width: 767px)"]);

  return (
    <Flex gap={"10px"} p={"10px"} border={"1px solid #4D4D4D"}>
      <Text whiteSpace={"nowrap"}>Sound FX</Text>
      <Slider
        aria-label="slider-ex-4"
        value={soundVolume}
        w={"100px"}
        onChange={(val) => updateContext({ soundVolume: val })}
      >
        <SliderTrack bg="#FFF" borderRadius={"0"}>
          <SliderFilledTrack bg="#FFF" />
        </SliderTrack>
        <SliderThumb
          borderRadius="0"
          bg={soundVolume === 0 ? "#BFBFBF" : "#00B94A"}
          h={"12px"}
          w={"6px"}
          _focusVisible={{ boxShadow: "none" }}
        ></SliderThumb>
      </Slider>
    </Flex>
  );
};

export default SoundFxSlider;
