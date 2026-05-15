"use client";

import Image from "next/image";

export default function FilterChipTag({
  isIcon = false,
  checked,
  label,
  value,
  iconSrc,
  containerStyle = "",
  iconStyle = "",
  labelStyle = "",
  onChagne,
}: {
  isIcon?: boolean;
  iconSrc?: string;
  checked: boolean;
  label: string;
  value: string | number;
  containerStyle?: string;
  iconStyle?: string;
  labelStyle?: string;
  onChagne: (value: string | number) => void;
}) {
  return (
    <button
      key={value}
      className={`h-[35px] flex items-center py-[5px] px-[10px] cursor-pointer border border-border rounded-[5px]
            ${checked ? "bg-blue" : "bg-transparent"}
           ${containerStyle}`}
      onClick={() => onChagne("")}
    >
      {isIcon && (
        <Image
          alt={""}
          src={iconSrc}
          width={20}
          height={20}
          className={iconStyle}
        />
      )}
      <span
        className={`text-[14px] leading-[15px] ${
          checked ? "text-white" : "text-text-gray"
        }${labelStyle}`}
      >
        {label}
      </span>
    </button>
  );
}
