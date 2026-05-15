import React from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`animate-spin fill-white ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="spinner-circle">
        <rect x="11" y="1" width="2" height="6" opacity="1" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(36 12 12)" opacity=".1" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(72 12 12)" opacity=".2" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(108 12 12)" opacity=".3" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(144 12 12)" opacity=".4" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(180 12 12)" opacity=".5" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(216 12 12)" opacity=".6" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(252 12 12)" opacity=".7" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(288 12 12)" opacity=".8" />
        <rect x="11" y="1" width="2" height="6" transform="rotate(324 12 12)" opacity=".9" />
      </g>
    </svg>
  );
};

export default Spinner;
