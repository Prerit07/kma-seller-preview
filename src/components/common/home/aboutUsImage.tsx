import React from "react";

const AboutUsImage = ({ imageUrl, width = '500px', height = '250px' }) => {
  return (
    <div
      className="relative"
      style={{
        width: width,
        height: height,
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="roundedClip" clipPathUnits="objectBoundingBox">
            <path
              d="
                M 0.790000,0.000000
                Q 0.800000 0.000000 0.800000,0.010000
                L 0.800000,0.130000
                L 0.800000 0.170000 0.740000,0.170000
                L 0.990000,0.170000
                Q 1.000000 0.170000 1.000000,0.180000
                L 1.000000,0.460000
                Q 1.000000 0.500000 1.000000,0.540000
                L 1.000000,0.990000
                Q 1.000000 1.000000 0.990000,1.000000
                L 0.210000,1.000000
                Q 0.200000 1.000000 0.200000,0.990000
                L 0.200000,0.870000
                L 0.200000 0.830000 0.260000,0.830000
                L 0.010000,0.830000
                Q 0.000000 0.830000 0.000000,0.810000
                L 0.00000,0.540000
                Q 0.000000 0.500000 0.000000,0.460000
                L 0.000000,0.020000
                Q 0.000000 0.000000 0.020000,0.000000
                L 0.660000,0.000000
                Z
              "
            />
          </clipPath>
        </defs>
      </svg>

      <div
        className="w-full h-full relative"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          clipPath: "url(#roundedClip)",
          WebkitClipPath: "url(#roundedClip)",
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <line
          x1="0.18"
          y1="0.867"
          x2="0.18"
          y2="1"
          stroke="white"
          stroke-width="0.006"
        ></line>
        <line
          x1="0"
          y1="0.872"
          x2="0.18"
          y2="0.872"
          stroke="white"
          stroke-width="0.01"
        ></line>
        <line
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
        ></line>
      </svg>
    </div>
  );
};

export default AboutUsImage;
