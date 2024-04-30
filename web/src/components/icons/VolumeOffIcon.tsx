import React from "react";

const VolumeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M7.33301 3.33325L3.99967 5.99992H1.33301V9.99992H3.99967L7.33301 12.6666V3.33325Z"
      stroke="#262019"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.667 6L10.667 10" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.667 6L14.667 10" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default VolumeOffIcon;
