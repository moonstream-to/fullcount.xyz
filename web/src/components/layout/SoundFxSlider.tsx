import { Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from "@chakra-ui/react";
import { useGameContext } from "../../contexts/GameContext";
import { useSound } from "../../hooks/useSound";

const SoundFxSlider = () => {
  const { soundVolume, updateContext } = useGameContext();
  const playSound = useSound();

  return (
    <Flex gap={"10px"} p={"9px"} border={"1px solid #262019"} color={"#262019"} bg={"#FFF"}>
      <Text whiteSpace={"nowrap"} fontSize={"14px"} lineHeight={"100%"}>
        Sound FX
      </Text>
      <Slider
        aria-label="slider-ex-4"
        value={soundVolume}
        w={"60px"}
        onChange={(val) => {
          playSound("soundVolume");
          updateContext({ soundVolume: val });
        }}
      >
        <SliderTrack bg="#CCC2B0" borderRadius={"0"}>
          <SliderFilledTrack bg="#262019" />
        </SliderTrack>
        <SliderThumb
          borderRadius="0"
          bg={soundVolume === 0 ? "#7E8E7F" : "#328449"}
          h={"15px"}
          w={"10px"}
          _focusVisible={{ boxShadow: "none" }}
        ></SliderThumb>
      </Slider>
    </Flex>
  );
};

export default SoundFxSlider;
