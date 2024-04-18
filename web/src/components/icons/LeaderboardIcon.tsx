import React from "react";

const LeaderboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M17.5 15H12.5V18.3333H17.5V15Z"
      stroke="#262019"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 10H7.5V18.3333H12.5V10Z"
      stroke="#262019"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 12.5H2.5V18.3333H7.5V12.5Z"
      stroke="#262019"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2L10.6735 4.07295H12.8532L11.0898 5.3541L11.7634 7.42705L10 6.1459L8.23664 7.42705L8.91019 5.3541L7.14683 4.07295H9.32646L10 2Z"
      fill="#262019"
      stroke="#262019"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default LeaderboardIcon;
