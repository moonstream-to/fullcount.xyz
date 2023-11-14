function variantMenuButton() {
  const c = "orange";
  return {
    _focus: {
      textDecoration: "underline",
    },
    _disabled: {
      bg: `${c}.200`,
    },
    _hover: {
      bg: `${c}.500`,
      // color: `${c}.100`,
      _disabled: {
        bg: `${c}.100`,
      },
    },
  };
}

const variantOrangeGradient = () => {
  return {
    border: "none",
    borderRadius: "30px",
    fontSize: ["md", "md", "lg", "lg", "xl", "xl"],
    textColor: "white",
    bg: "linear-gradient(92.26deg, #F56646 8.41%, #FFFFFF 255.37%)",
    fontWeight: "700",
    padding: "5px 30px",
    maxHeight: "36px",
    _hover: {
      bg: "linear-gradient(264.06deg, #F56646 -6.89%, #FFFFFF 335.28%)",
    },
  };
};

const variantMoonboundButton = () => {
  return {
    color: "white",
    fontWeight: "700",
    fontSize: { base: "16px", sm: "18px" },
    bg: "#54808C",
    borderRadius: "40px",
    border: "1px solid #F1E3BF",
    _hover: {
      bg: "#2A778C",
    },
  };
};

const variantWyrmButton = () => {
  return {
    minW: ["100%", "100%", "0"],
    px: ["0", "0", "80px"],
    fontSize: ["16px", "20px", "20px"],
    h: ["40px", "46px", "46px"],
    borderRadius: "30px",
  };
};

const variantSelector = () => {
  return {
    p: "0px",
    lineHeight: "1",
    fontSize: "24px",
    fontWeight: "700",
    h: "24px",
    color: "#4d4d4d",
    _disabled: {
      color: "white",
      cursor: "default",
      opacity: "1",
    },
  };
};

const variantPlainOrange = () => {
  return {
    alignItems: "center",
    justifyContent: "center",
    border: "solid transparent",
    borderRadius: "30px",
    // variant: "solid",
    fontSize: ["md", "md", "lg", "lg", "xl", "xl"],
    textColor: "white",
    bg: "#F56646",
    fontWeight: "700",
    padding: "10px 30px",
    _hover: {
      backgroundColor: "#F4532F",
      textDecoration: "none",
    },
    _focus: {
      backgroundColor: "#F4532F",
    },
    _active: {
      backgroundColor: "#F4532F",
    },
  };
};

const variantTransparent = () => {
  return {
    backgroundColor: "transparent",
    _hover: {
      backgroundColor: "transparent",
      textDecoration: "none",
    },
    _focus: {
      backgroundColor: "transparent",
      outline: "none",
    },
    _focusVisible: { boxShadow: "none" },
    _active: {
      backgroundColor: "transparent",
      outline: "none",
      boxShadow: "none",
    },
  };
};

const variantCancel = () => {
  return {
    padding: "10px 40px",
    backgroundColor: "#4D4D4D",
    _hover: {
      backgroundColor: "#4D4D4D",
      textDecoration: "none",
    },
    _focus: {
      backgroundColor: "#4D4D4D",
    },
    _active: {
      backgroundColor: "#4D4D4D",
    },
  };
};

const variantSave = () => {
  return {
    padding: "10px 80px",
    backgroundColor: "#F56646",
    _hover: {
      backgroundColor: "#F56646",
      textDecoration: "none",
      _disabled: {
        backgroundColor: "#F56646",
      },
    },
    _focus: {
      backgroundColor: "#F56646",
    },
    _active: {
      backgroundColor: "#F56646",
    },
  };
};

const variantRun = () => {
  return {
    padding: "10px 80px",
    backgroundColor: "#F56646",
    _hover: {
      backgroundColor: "#F56646",
      textDecoration: "none",
      _disabled: {
        backgroundColor: "#BFBFBF",
      },
    },
    _disabled: {
      backgroundColor: "#BFBFBF",
      cursor: "not-allowed",
    },
    _focus: {
      backgroundColor: "#F56646",
    },
    _active: {
      backgroundColor: "#F56646",
    },
  };
};

const variantClaimButton = () => {
  return {
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "20px",
    _disabled: {
      opacity: 1,
      cursor: "not-allowed",
    },
  };
};

const variantWhiteOutline = () => {
  return {
    color: "white",
    border: "2px solid white",
    borderRadius: "30px",
    bg: "transparent",
    p: "10px 30px",
    fontSize: "20px",
    textDecoration: "none",
    _hover: {
      backgroundColor: "transparent",
      borderWidth: "3px",
      p: "9px 29px",
    },
    _focus: {
      backgroundColor: "transparent",
    },
    _active: {
      backgroundColor: "transparent",
    },
  };
};

const variantSolidWhite = () => {
  return {
    bg: "white",
    textColor: "black",
    border: "none",
    borderRadius: "30px",
    p: "10px 30px",
    fontSize: ["md", "md", "lg", "lg", "xl", "xl"],
    _hover: {
      bg: "#E6E6E6",
    },
  };
};

const Button = {
  // 1. We can update the base styles
  baseStyle: () => ({
    px: "1rem",
    py: "1rem",
    transition: "0.1s",
    width: "fit-content",
    borderRadius: "md",
    borderStyle: "solid",
    fontWeight: "600",
    m: 0,
    // m: 1,

    // _active: {
    //   bg: `${props.colorScheme}.${props.colorMode}.200`,
    //   color: `${props.colorScheme}.${props.colorMode}.50`,
    // },
    // _focus: {
    //   bg: `${props.colorScheme}.${props.colorMode}.400`,
    //   color: `${props.colorScheme}.${props.colorMode}.50`,
    // },
  }),
  // 2. We can add a new button size or extend existing
  sizes: {
    xl: {
      h: 16,
      minW: 16,
      fontSize: "4xl",
      px: 8,
    },
  },

  // 3. We can add a new visual variant
  variants: {
    menuButton: variantMenuButton,
    plainOrange: variantPlainOrange,
    whiteOutline: variantWhiteOutline,
    orangeGradient: variantOrangeGradient,
    wyrmButton: variantWyrmButton,
    selector: variantSelector,
    cancelButton: variantCancel,
    saveButton: variantSave,
    runButton: variantRun,
    transparent: variantTransparent,
    claimButton: variantClaimButton,
    solidWhite: variantSolidWhite,
    moonboundButton: variantMoonboundButton,
  },
};
export default Button;
