import React from "react";

const QuestionMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    {...props}
  >
    <path
      d="M12.5391 12.3077C13.1419 10.594 14.3318 9.14895 15.8979 8.2285C17.4641 7.30806 19.3055 6.97159 21.0959 7.27871C22.8864 7.58582 24.5104 8.51669 25.6803 9.90644C26.8502 11.2962 27.4905 13.0551 27.4878 14.8718C27.4878 20 19.7955 22.5641 19.7955 22.5641V28"
      stroke="#262019"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 32.8208H20.0256"
      stroke="#262019"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default QuestionMarkIcon;
