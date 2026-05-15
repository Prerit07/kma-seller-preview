import React from "react";
import Select from "react-select";
import {
  StylesConfig,
  Props as ReactSelectProps,
  GroupBase,
  MultiValue,
} from "react-select";

export type OptionType = {
  value: string;
  label: string;
  [key: string]: any
};

export interface DynamicAsyncSelectProps
  extends Partial<
    ReactSelectProps<OptionType, boolean, GroupBase<OptionType>>
  > {
  isMulti?: boolean;
  isError?: boolean;
  placeholder?: React.ReactNode | string;
  onChange?: (
    value: OptionType | MultiValue<OptionType> | null
  ) => void;
  value?: OptionType | MultiValue<OptionType> | null;
  minHeight?: string | number,
  fontwidth?: string
}

const DynamicSelect = ({
  isMulti = false,
  placeholder = "Start typing...",
  onChange,
  styles,
  value,
  isError,
  minHeight = '47.81px',
  options = [],
  fontwidth,
  ...rest
}: DynamicAsyncSelectProps) => {
  const defaultStyles: StylesConfig<OptionType, boolean> = {
    control: (base) => ({
      ...base,
      borderRadius: 9999,
      boxShadow: "none",
      borderColor: isError ? "#fb2c36" : "var(--color-border)",
      "&:hover": {
        borderColor: isError ? "#fb2c36" : "var(--color-border)",
      },
      minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      paddingLeft: "0.5rem",
      fontSize: minHeight == '47.81px' ? '1rem' : (fontwidth ? fontwidth : '0.750rem'),
      fontFamily: "IBM Plex Sans",
    }),
    input: (base) => ({ ...base, paddingLeft: 0 }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-text-gray)",
      fontWeight: 400,
      fontFamily: "IBM Plex Sans",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingRight: "0.5rem",
      color: "var(--color-text-gray)",
      height: '30px',
      alignItems: 'center'
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
      borderRadius: 8,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-blue)"
        : state.isFocused
        ? "var(--color-light-purple)"
        : "white",
      color: state.isSelected ? "var(--color-white)" : "var(--color-blue)",
      cursor: "pointer",
      ":active": {
        ...base[":active"],
        backgroundColor: !state.isDisabled
          ? "var(--color-blue)"
          : undefined,
        color: "white",
      },
    }),
  };

  return (
    <div className="w-full">
    <Select<OptionType, boolean>
      isMulti={isMulti}
      placeholder={placeholder}
      options={options}
      styles={styles || defaultStyles}
      onChange={onChange}
      value={value}
      {...rest}
    />
    </div>
  );
};

export default DynamicSelect;
