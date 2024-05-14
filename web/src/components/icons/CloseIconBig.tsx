import React from "react";

const CloseIconBig: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M20.4852 20.4706L3.51465 3.5"
      stroke={props.stroke ?? "#7E8E7F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.51381 20.4706L20.4844 3.5"
      stroke={props.stroke ?? "#7E8E7F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CloseIconBig;
