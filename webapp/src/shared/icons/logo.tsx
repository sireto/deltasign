import React from "react";

const CustomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M16 16C16 7.16444 8.83556 0 0 0L0 16H16Z" fill="#19902E" />
  </svg>
);

export default CustomIcon;
