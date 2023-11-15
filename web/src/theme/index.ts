import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import breakpoints from "./breakpoints";

// Foundational style overrides
import colors from "./foundations/colors";

// Component style overrides
import Button from "./components/button";
import Menu from "./components/menu";
import Text from "./components/text";
import IconButton from "./components/iconButton";
import { radioTheme } from "./components/radio";

const overrides = {
  breakpoints,
  colors,
  // Other foundational style overrides go here
  components: {
    Radio: radioTheme,
    Button,
    Menu,
    Text,
    IconButton,
    Input: {
      variants: {
        address: {
          field: {
            _placeholder: {
              color: "#AAAAAA",
              fontSize: "14px",
            },
            border: "1px solid white",
            bg: "transparent",
            fontSize: "min(18px, 9px + 0.7vw)",
            w: "42ch",
            px: "1ch",
          },
        },
        text: {
          field: {
            border: "1px solid white",
            bg: "transparent",
          },
        },
      },
    },
    // Other components go here
  },
  styles: {
    global: () => ({
      body: {
        bg: "#1A1D22",
        color: "white",
      },
      a: {
        _hover: {
          fontWeight: "700",
          textDecoration: "none",
        },
      },
    }),
  },
  fonts: {
    heading: '"Inter", serif',
    body: '"Inter", serif',
    mono: '"Inter", monospace',
  },
  fontSizes: {
    xs: "0.625rem", //10px
    sm: "0.875rem", //14px
    md: "1rem", //16px
    lg: "1.25rem", //20px
    xl: "1.375rem", //22
    "2xl": "1.5rem", //24px
    "3xl": "1.625rem", //26
    "4xl": "1.875rem", //30px
    "5xl": "2.625rem", //42px
    "6xl": "3.75rem", //60px
    "7xl": "4.5rem", //72px
  },
};

export default extendTheme(overrides);
