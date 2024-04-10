import React from "react";

const ErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M7.86 1.99805H16.14L22 7.85805V16.138L16.14 21.998H7.86L2 16.138V7.85805L7.86 1.99805Z"
      stroke="#262019"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 9L9 15" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 9L15 15" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ErrorIcon;
