// import { mode, whiten } from "@chakra-ui/theme-tools"

const Menu = {
  parts: ["button", "list", "item"],
  baseStyle: () => {
    return {
      button: {
        _active: { textDecoration: "none", backgroundColor: "#1A1D22" },
        _focus: { textDecoration: "none", backgroundColor: "#1A1D22" },
        _hover: {
          textDecoration: "none",
          backgroundColor: "#1A1D22",
          fontWeight: "700",
        },
      },
      item: {
        backgroundColor: "#1A1D22",
        fontWeight: "400",
        fontSize: "md",
        _hover: {
          textColor: "orange.1000",
          fontWeight: "700",
        },
        _focus: {
          textColor: "green.100",
        },
      },
      list: {
        bg: "#1A1D22",
        borderWidth: 0,
        px: "15px",
      },
    };
  },
};

export default Menu;
