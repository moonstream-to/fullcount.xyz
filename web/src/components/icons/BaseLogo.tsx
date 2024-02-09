import React from "react";

const BaseLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    {...props}
  >
    <path
      d="M16.3761 29.9597C23.8454 29.9597 29.8999 23.916 29.8999 16.4597C29.8999 9.0034 23.8454 2.95972 16.3761 2.95972C9.29026 2.95972 3.4777 8.40076 2.8999 15.3246H20.775V17.5948H2.8999C3.4777 24.5187 9.29026 29.9597 16.3761 29.9597Z"
      fill="#1A54F4"
    />
  </svg>
);

export default BaseLogo;
