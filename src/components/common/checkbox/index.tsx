import React from "react";

export default function CustomCheckbox({checked, label, value, onClick} : {checked: boolean, label: string, value: string, onClick?: (value: string) => void}) {
  return (
    <div className="min-w-[150px] flex-1 flex items-center">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          value={value}
          onChange={(e) => {
            if(onClick){
              onClick(label)
            }
          }}
          className="w-5 h-5 border border-gray-400 rounded-md cursor-pointer accent-text-black checked:border-text-black transition-all duration-200"
        />
        <span className="text-text-black text-sm">{label}</span>
      </label>
    </div>
  );
}
