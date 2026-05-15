import React from "react";
import AsyncSelect from "react-select/async";
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
  loadOptions: (inputValue: string) => Promise<OptionType[]>; // Only string[]
  isMulti?: boolean;
  isError?: boolean;
  placeholder?: React.ReactNode | string;
  onChange?: (
    value: OptionType | MultiValue<OptionType> | null
  ) => void;
  value?: OptionType | MultiValue<OptionType> | null;
  minHeight?: string | number;
  enableAddManually?: boolean;
  menualAddItem?: {value: string, label: string}
}

const DynamicAsyncSelect = ({
  isMulti = false,
  placeholder = "Start typing...",
  loadOptions,
  onChange,
  styles,
  value,
  isError,
  minHeight = '47.81px',
  enableAddManually = false,
  menualAddItem,
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
      paddingLeft: "1rem",
      fontSize: "1rem",
    }),
    input: (base) => ({ ...base, paddingLeft: 0 }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-text-gray)",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    clearIndicator: () => ({
      color: 'var(--color-text-gray)',
      padding: '10px',
      cursor: 'pointer'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingRight: "1rem",
      color: "var(--color-text-gray)",
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
      borderRadius: 8,
      zIndex: 50,
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
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--color-light-purple)",
      borderRadius: "5px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--color-text-black)",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--color-text-black)",
      cursor: "pointer",
      padding: "2px",
      borderRadius: "9999px",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "var(--color-light-purple)",
      },
    }),
  };

  const normalizedLoadOptions = async (
    inputValue: string
  ): Promise<OptionType[]> => {
    const result = await loadOptions(inputValue);
    return Array.isArray(result) && enableAddManually ? [...result, menualAddItem] : result 
  };

  return (
    <div className="w-full">
    <AsyncSelect<OptionType, boolean>
      isMulti={isMulti}
      placeholder={placeholder}
      loadOptions={normalizedLoadOptions}
      styles={styles || defaultStyles}
      onChange={onChange}
      value={value}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      isClearable={true}
      {...rest}
    />
    </div>
  );
};

export default DynamicAsyncSelect;
