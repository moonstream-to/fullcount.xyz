import { extendTheme } from "@chakra-ui/react";
import breakpoints from "./breakpoints";

const theme = extendTheme({
  breakpoints,

  styles: {
    global: () => ({
      body: {
        bg: "#1A1D22",
      },
    }),
  },
});

export default theme;
