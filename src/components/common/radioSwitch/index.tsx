"use client";
import Radio from "@mui/material/Radio";

export default function RadioSwitch({
  checked,
  label,
  value,
  labelStyle,
  onChagne,
}: {
  checked: boolean;
  label: string;
  value: string | number;
  labelStyle: string;
  onChagne: (value: string | number) => void;
}) {
  return (
    <label
      key={value}
      className={`
            min-w-[100px] flex flex-1 items-center py-[5px] px-2 rounded-full cursor-pointer transition-all border
            ${
              checked
                ? "bg-light-purple border-light-purple"
                : "bg-transparent border-border"
            }
          `}
    >
      <Radio
        checked={checked}
        onChange={() => onChagne(value)}
        value={value}
        name="userType"
        // className="p-0.5 sm:p-1"
        disableRipple
        disableFocusRipple
        disableTouchRipple
        sx={{
          padding: {
            xs: "2px",
            sm: "3px 2px 3px 3px",
            md: "4px 4px 4px 4px",
          },
          color: "var(--color-text-black)",
          "& .MuiSvgIcon-root": {
            fontSize: 24,
          },

          "&.Mui-checked": {
            color: "var(--color-text-black)",
            '& [data-testid="RadioButtonCheckedIcon"]': {
              transform: "scale(1.3)",
            },
          },
    
        }}
      />
      <span className={labelStyle}>{label}</span>
    </label>
  );
}
