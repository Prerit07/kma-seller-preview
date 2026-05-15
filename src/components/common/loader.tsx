import React from "react";

const Loader = () => {
    const icons = [
        "/assets/app/kma-favicon.svg",
        "/assets/app/m.svg",
        "/assets/app/a.svg",
    ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
      <div className="flex items-end gap-1">
        {icons.map((Svg, index) => (
          <span
            key={index}
            className="w-10 h-10"
            style={{
              animation: "bounceWave 1.2s ease-in-out infinite",
              animationDelay: `${index * 0.15}s`,
            }}
          >
            <img src={Svg} alt="loader" className="w-full h-full" />
          </span>
        ))}
      </div>

      
      <style>
        {`
          @keyframes bounceWave {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-14px);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
