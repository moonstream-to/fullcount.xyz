import React from "react";

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    {...props}
  >
    <path
      d="M21.5001 4.45972L5.50011 4.45972C4.39554 4.45972 3.5001 4.45801 3.5001 4.45801V20.4597C3.5001 21.5643 3.49927 22.4597 3.49927 22.4597H21.5001V20.4597V6.45972V4.45972Z"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M16.5 2.45972V6.45972"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M8.5 2.45972V6.45972"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M3.5 10.4597H21.5"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 14.4597H8.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 14.4597H12.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 14.4597H16.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 18.4597H8.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 18.4597H12.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 18.4597H16.51"
      stroke={props.color ?? "white"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CalendarIcon;
