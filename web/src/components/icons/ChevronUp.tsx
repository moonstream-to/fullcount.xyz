import React from "react";

const ChevronUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path d="M4 10L8 6L12 10" stroke="white" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default ChevronUp;
