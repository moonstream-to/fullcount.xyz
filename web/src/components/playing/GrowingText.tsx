import React from "react";
import { Box, keyframes } from "@chakra-ui/react";
import { css } from "@emotion/react";

// Define the keyframes
const growAnimation = keyframes`
  0% { transform: scale(0); }
  90% { transform: scale(1.5); }
  100% { transform: scale(1); }
`;

// Apply the animation in a css prop using emotion's css
const animationStyle = css`
  animation: ${growAnimation} 1.5s ease-in forwards;
`;

interface GrowingComponentProps {
  isVisible: boolean;
  children: React.ReactNode;
  [key: string]: any;
}

const GrowingComponent: React.FC<GrowingComponentProps> = ({ children, isVisible, ...props }) => {
  if (!isVisible) return <></>;
  return (
    <Box position={"absolute"} css={animationStyle} {...props}>
      {children}
    </Box>
  );
};

export default GrowingComponent;
