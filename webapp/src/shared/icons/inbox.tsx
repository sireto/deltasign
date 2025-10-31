import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

const InboxIcon: React.FC<IconProps> = ({ color = "#3F576F", ...props }) => {
  return (
    <svg
      width="19"
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 9H4.91147C5.42538 9 5.89518 9.29035 6.125 9.75C6.35482 10.2096 6.82462 10.5 7.33853 10.5H11.6615C12.1754 10.5 12.6452 10.2096 12.875 9.75C13.1048 9.29035 13.5746 9 14.0885 9H17M2 9V6.6C2 5.33988 2 4.70982 2.24524 4.22852C2.46095 3.80516 2.80516 3.46095 3.22852 3.24524C3.70982 3 4.33988 3 5.6 3H13.4C14.6601 3 15.2902 3 15.7715 3.24524C16.1948 3.46095 16.539 3.80516 16.7548 4.22852C17 4.70982 17 5.33988 17 6.6V9M2 9V11.4C2 12.6601 2 13.2902 2.24524 13.7715C2.46095 14.1948 2.80516 14.539 3.22852 14.7548C3.70982 15 4.33988 15 5.6 15H13.4C14.6601 15 15.2902 15 15.7715 14.7548C16.1948 14.539 16.539 14.1948 16.7548 13.7715C17 13.2902 17 12.6601 17 11.4V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default InboxIcon;
