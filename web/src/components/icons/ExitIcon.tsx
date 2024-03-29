import React from "react";

const ExitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M6.00003 14H3.33336C2.97974 14 2.00007 14 2.00007 14C2.00007 14 2.00003 13.0203 2.00003 12.6667V3.33333C2.00003 2.97971 2 2 2 2C2 2 2.97974 2 3.33336 2H6.00003"
      stroke="#262019"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.666 11.3332L13.9993 7.99984L10.666 4.6665"
      stroke="#262019"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 8H6" stroke="#262019" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ExitIcon;
