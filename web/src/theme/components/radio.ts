import { radioAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  radioAnatomy.keys,
);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  control: {
    borderSize: "1px",
    width: "16px",
  },
});

export const radioTheme = defineMultiStyleConfig({ baseStyle });
