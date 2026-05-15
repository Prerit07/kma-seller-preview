import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from "@mui/material";
import Image from "next/image";

export type OptionType = {
  value: string;
  label: string;
  [key: string]: any;
};

export interface DynamicAsyncAutocompleteProps {
  loadOptions: (inputValue: string) => Promise<OptionType[]>;
  isMulti?: boolean;
  isError?: boolean;
  placeholder?: string | React.ReactNode;
  onChange?: (value: OptionType | OptionType[] | null) => void;
  value?: OptionType | null | OptionType[];
  minHeight?: string | number;
  enableAddManually?: boolean;
  menualAddItem?: OptionType;
  styles?: any;
}

const DynamicAsyncAutocomplete: React.FC<DynamicAsyncAutocompleteProps> = ({
  loadOptions,
  isMulti = false,
  placeholder = "Start typing...",
  onChange,
  value,
  isError = false,
  minHeight = 40,
  enableAddManually = false,
  menualAddItem,
  styles,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!open || inputValue.trim() === "") {
        setOptions([]);
        return;
      }

      setLoading(true);
      const result = await loadOptions(inputValue);
      if (active) {
        let opts = Array.isArray(result) ? result : [];
        if (enableAddManually && menualAddItem) {
          opts = [...opts, menualAddItem];
        }
        setOptions(opts);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [inputValue, open, loadOptions, enableAddManually, menualAddItem]);

  return (
    <Autocomplete
      clearIcon={false}
      multiple={isMulti}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value || (isMulti ? [] : null)}
      onChange={(e, newValue: OptionType | OptionType[]) => {
        onChange?.(newValue)
      }}
      inputValue={inputValue}
      onInputChange={(e, val) => setInputValue(val)}
      getOptionLabel={(option: OptionType) => option?.label ?? ""}
      renderOption={(props, option: OptionType) => {
        if (option.value === "__add_manually__") {
          return (
            <li {...props} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-gray-700 cursor-pointer border-t border-red-200">
              <Image src='/assets/error.svg' alt='error' width={15} height={15} />
              <span className="text-sm">
                {option.label}
                <span className="ml-1 text-purple-600 font-medium underline">
                  Add Manually
                </span>
              </span>
            </li>
          );
        }

        return (
          <li {...props}>
            {option.label}
          </li>
        );
      }}
      isOptionEqualToValue={(opt:OptionType, val: OptionType) => opt.value === val.value}
      loading={loading}
      filterOptions={(x) => x}
      componentsProps={{
        popupIndicator: { style: { display: "none" } },
        }}
      sx={{
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: "9999px",
    minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
    fontSize: "0.95rem",
    paddingLeft: "0.75rem",
    paddingRight: "0.5rem",
    boxShadow: "none",

    "& fieldset": {
      borderColor: 'var(--color-border)',
      boxShadow: "none",
    },
    "&:hover fieldset": {
      borderColor: 'var(--color-border)',
      boxShadow: "none",
    },
    "&.Mui-focused fieldset": {
      borderColor: 'var(--color-border)',
      boxShadow: "none",
      borderWidth: '1px'

    },
    "&.MuiOutlinedInput-root.Mui-focused": {
      borderColor: 'var(--color-border)',
      boxShadow: "none",
    },
  },
  "& .MuiInputBase-input": {
    padding: "0 !important",
    paddingLeft: "12px !important",
    height: "1.5rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
    color: "var(--color-text-gray)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: "1px",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: 'var(--color-border)'
  },
  "& .MuiAutocomplete-popupIndicator": {
    display: "none",
  },
  ...styles,
}}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={
            typeof placeholder === "string" ? placeholder : undefined
          }
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          error={isError}
        />
      )}
    />
  );
};

export default DynamicAsyncAutocomplete;
