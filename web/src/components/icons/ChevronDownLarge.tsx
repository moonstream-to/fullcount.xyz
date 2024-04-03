import React from "react";

const ChevronDownLarge: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path d="M6 9L12 15L18 9" stroke="#262019" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default ChevronDownLarge;
