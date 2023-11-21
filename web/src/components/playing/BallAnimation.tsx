import { css } from "@emotion/react";
import { Box, keyframes } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface BallAnimationProps {
  isVisible: boolean;
  duration?: string;
  children: React.ReactNode;
  startTop: number;
  startLeft: number;
  endTop: number;
  endLeft: number;
  curve: number;
  [key: string]: any;
}

const BallAnimation: React.FC<BallAnimationProps> = ({
  duration = "1.5s",
  children,
  isVisible,
  startTop = 150,
  startLeft = 150,
  endTop,
  endLeft,
  curve,
  ...props
}) => {
  useEffect(() => {
    console.log(startLeft, endLeft, endLeft - startLeft);
  }, [startTop, startLeft, endTop, endLeft]);
  const growAndMoveCurlyAnimation = keyframes`
  0% {
    transform: translate(${startLeft - endLeft}px, ${-100 - endTop}px) scale(0);
    opacity: 0;
  }
    ${
      curve
        ? `60% {
      transform: translate(${endLeft - curve}px, ${(-100 - endTop) * 0.6}px) scale(0.6);
      opacity: 0.6;
    }`
        : ""
    }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
`;

  const animationStyle = css`
    animation: ${growAndMoveCurlyAnimation} ${duration} ease-in;
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

export default BallAnimation;
