import React from "react";

const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M6.25 14.1668L2.08333 10.0002L6.25 5.8335"
      stroke="#262019"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M17.5 10L2.5 10" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ArrowLeft;
