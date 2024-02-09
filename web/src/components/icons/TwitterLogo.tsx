import React from "react";

const TwitterLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    {...props}
  >
    <path
      d="M10.4304 13.958L16.7178 22.3638H21.4568L13.0502 11.1319M10.4304 13.958L2.5 3.36377H7.23612L13.0502 11.1319M10.4304 13.958L2.65071 22.3638M13.0502 11.1319L20.2052 3.36377"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TwitterLogo;
