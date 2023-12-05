import { css } from "@emotion/react";
import { Box, keyframes } from "@chakra-ui/react";
import React from "react";

interface BallAnimationProps {
  isVisible: boolean;
  duration?: string;
  children: React.ReactNode;
  endTop: number;
  endLeft: number;
  [key: string]: any;
}

const BatAnimation: React.FC<BallAnimationProps> = ({
  duration = "1.5s",
  children,
  isVisible,
  endTop,
  endLeft,
  ...props
}) => {
  const animation = keyframes`
  0% { transform: scale(4); }
  50% { transform: scale(2.5); }
  100% { transform: scale(1); }
`;

  const animationStyle = css`
    animation: ${animation} ${duration} ease-in;
  `;

  if (!isVisible) return <></>;
  return (
    <Box
      position={"absolute"}
      css={animationStyle}
      left={`${endLeft}px`}
      top={`${endTop}px`}
      {...props}
    >
      {children}
    </Box>
  );
};

export default BatAnimation;
