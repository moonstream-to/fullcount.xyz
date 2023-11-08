const variantTransparent = () => {
  return {
    _hover: { bg: "transparent" },
    _disabled: { cursor: "default", opacity: "0.5" },
    bg: "red",
    color: "white",
  };
};

const IconButton = {
  variants: {
    transparent: variantTransparent,
  },
};

export default IconButton;
