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

interface GrowingComponentProps {
  isVisible: boolean;
  duration?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const GrowingComponent: React.FC<GrowingComponentProps> = ({
  duration = "1.5s",
  children,
  isVisible,
  ...props
}) => {
  const animationStyle = css`
    animation: ${growAnimation} ${duration} ease-in forwards;
  `;

  if (!isVisible) return <></>;
  return (
    <Box position={"absolute"} css={animationStyle} {...props}>
      {children}
    </Box>
  );
};

export default GrowingComponent;
