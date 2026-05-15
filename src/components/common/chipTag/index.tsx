"use client";

import Image from "next/image";

export default function ChipTag({
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
      className={`h-[40px] flex items-center py-[10px] px-5 cursor-pointer border border-border rounded-full
            ${checked ? "bg-light-purple" : "bg-transparent"}
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
        className={`text-sm leading-[24px] ${
          checked ? "font-medium" : ""
        }${labelStyle}`}
      >
        {label}
      </span>
    </button>
  );
}
