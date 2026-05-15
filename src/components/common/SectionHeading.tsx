import React from "react";

const SectionHeading = ({ title, subtitle, description, type, color, lineTop }) => {
  const isCenter = type === "center";

  const mainColor = color || "#0D1520";
  const lineColor = color || "#778f9c";
  const innerLineColor = color === "white" ? "#778f9c" : "#0D1520";
  const descColor = color === "white" ? "#d5d5d5" : "#5C727D";

  const Line = () => (
    <span
      className="w-10 h-[4px] flex items-center justify-end"
      style={{ backgroundColor: lineColor }}
    >
      <span
        className="w-5 h-[4px]"
        style={{ backgroundColor: innerLineColor }}
      />
    </span>
  );

  return (
    <div
      className={`flex flex-col gap-1.5 ${
        isCenter ? "items-center" : "items-start"
      }`}
    >
      {lineTop && <Line />}

      <div
        className={`flex items-center gap-3 mb-1 ${
          isCenter ? "justify-center" : "justify-start"
        }`}
      >
        {!lineTop && <Line />}
        {title && <h3 className={`text-[18px] font-medium ${isCenter ? "text-center" : "text-left"}`} style={{ color: mainColor }}>{title}</h3>}
      </div>

      <h2
        className={`text-[28px] leading-9 font-semibold ${
          isCenter ? "text-center" : "text-left"
        }`}
        style={{ color: mainColor }}
      >
        {subtitle}
      </h2>

      {description && (
        <p
          className={`text-md mt-1 leading-6 font-normal ${
            isCenter ? "text-center" : "text-left"
          }`}
          style={{ color: descColor }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
