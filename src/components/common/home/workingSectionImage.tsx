import React from "react";

const WorkingSectionImage = ({ imageUrl, width = 500, height = 250 }) => {
  return (
    <div
      className="relative"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="roundedClipimage" clipPathUnits="objectBoundingBox">
  <path d="
    M 0.05 0
    L 0.70 0
    Q 0.75 0 0.75 0.08

    L 0.75 0.25
    Q 0.75 0.25 0.77 0.25

    L 0.93 0.25
    Q 1 0.25 1 0.35

    L 1 0.93
    Q 1 1 0.93 1

    L 0.30 1
    Q 0.25 1 0.25 0.93

    L 0.25 0.75
    Q 0.25 0.75 0.23 0.75

    L 0.08 0.75
    Q 0 0.75 0 0.67

    L 0 0.08
    Q 0 0 0.08 0
    Z
  "/>
</clipPath>
        </defs>
      </svg>

      <div
        className="w-full h-full relative"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          clipPath: "url(#roundedClipimage)",
          WebkitClipPath: "url(#roundedClipimage)",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <line
          x1="0.224"
          y1="0.780"
          x2="0.224"
          y2="0.950"
          stroke="white"
          stroke-width="0.013"
        ></line>
        <line
          x1="0.07"
          y1="0.790"
          x2="0.23"
          y2="0.790"
          stroke="white"
          stroke-width="0.020"
        ></line>
        {/* <line
          x1="0.82"
          y1="0.128"
          x2="1"
          y2="0.128"
          stroke="white"
          stroke-width="0.01"
        ></line>
        <line
          x1="0.82"
          y1="0"
          x2="0.82"
          y2="0.133"
          stroke="white"
          stroke-width="0.006"
        ></line> */}
      </svg>
    </div>
  );
};

export default WorkingSectionImage;
