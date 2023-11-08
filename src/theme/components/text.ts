const variantTitle = () => {
  return {
    padding: "0px",
    fontWeight: "700",
    fontSize: "24px",
    lineHeight: "100%",
    userSelect: "none",
  };
};

const variantTitle2 = () => {
  return {
    padding: "0px",
    fontWeight: "700",
    fontSize: "20px",
    lineHeight: "100%",
    userSelect: "none",
  };
};

const variantTitle3 = () => {
  return {
    padding: "0px",
    fontWeight: "700",
    fontSize: "16px",
    lineHeight: "100%",
    userSelect: "none",
  };
};

const variantLabel = {
  fontSize: "16px",
  fontWeight: "400",
  lineHight: "20px",
  userSelect: "none",
};
const variantHint = () => {
  return {
    fontSize: "16px",
    fontWeight: "400",
    lineHight: "20px",
    color: "#E6E6E6",
  };
};
const variantTooltip = {
  fontWeight: "700",
  position: "absolute",
  top: "-40px",
  left: "69%",
  transform: "translate(-50%, 0)",
  bg: "#2d2d2d",
  borderRadius: "8px",
  p: "5px 10px",
  userSelect: "none",
  border: "2px solid #BBBBBB",
  _hover: {
    borderColor: "green",
    color: "green",
  },
};
const variantText = () => {
  return {
    fontSize: "14px",
    fontWeight: "400",
    lineHight: "18px",
    color: "#FFFFFF",
  };
};

const Text = {
  variants: {
    title: variantTitle,
    title2: variantTitle2,
    title3: variantTitle3,
    hint: variantHint,
    text: variantText,
    label: variantLabel,
    tooltip: variantTooltip,
  },
};

export default Text;
