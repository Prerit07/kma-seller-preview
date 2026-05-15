'use client';

import { useMemo } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { InputBase } from '@mui/material';
import clsx from 'clsx';

interface OptionType {
  value: string;
  label: string;
  [key: string]: any;
}

interface MobileInputProps {
  placeHolder?: string;
  value?: string;
  onChange?: (value: string, countryCode: string) => void;
  required?: boolean;
  validationMessage?: string;
  dropdownValue?: string;
  disabled?: boolean;
  options: OptionType[]
}

const customSelectStyles: StylesConfig<OptionType, false> = {
  control: (base) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: 'auto',
    height: '100%',
    cursor: 'pointer',
    width: '100%',
    minWidth: '120px',
    fontWeight: 'normal'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 0,
    color: '#000',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    padding: 0,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: 0,
    paddingLeft: '4px',
    color: '#000',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--color-text-black)',
  }),
  menu: (base) => ({
    ...base,
    width: '200px',
    marginTop: '14px',
    fontSize: '0.875rem',
    borderRadius: 8,
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--color-blue)'
      : state.isFocused
      ? 'var(--color-light-purple)'
      : 'white',
    color: state.isSelected ? 'white' : 'var(--color-blue)',
    cursor: 'pointer',
    ':active': {
      ...base[':active'],
      backgroundColor: !state.isDisabled
        ? 'var(--color-blue)'
        : undefined,
      color: 'white',
    },
  }),
};

export default function DynamicInput({
  placeHolder = 'Enter details',
  validationMessage = '',
  value = '',
  onChange,
  required = false,
  dropdownValue = '',
  disabled = false,
  options = []
}: MobileInputProps) {
    const fieldValue = useMemo(() => {
        return value
      }, [value])
    
      const selectedDropdownValue = useMemo(() => {
        return options.find(option => option.value === dropdownValue)
      },[dropdownValue])
    
      const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        if (onChange) {
          onChange(input, dropdownValue);
        }
      };
    
      const handleDropdownChange = (selected: SingleValue<OptionType>) => {
        if (selected) {
          if (onChange) {
            onChange(fieldValue, selected.value);
          }
        }
      };

  return (
    <div className="w-full h-[40px]">
      <div
        className={clsx(
          'flex items-center w-full border rounded-full transition-all',
          validationMessage && required ? 'border-red-500' : 'border-border',
          disabled && 'cursor-not-allowed'
        )}
      >
       

        <InputBase
          placeholder={placeHolder}
          fullWidth
          value={fieldValue}
          onChange={handleFieldChange}
          // disabled={disabled}
          className="px-4 py-2 text-gray text-sm border-r border-gray-300 h-[39px] font-ibm-plex-sans!"
          inputProps={{
            className: 'placeholder-gray outline-none font-ibm-plex-sans!',
          }}
        />
         <div className="px-2 flex items-center">
          <Select
            instanceId="dropdown"
            options={options}
            value={selectedDropdownValue}
            styles={customSelectStyles}
            isSearchable={false}
            onChange={handleDropdownChange}
            components={{ IndicatorSeparator: () => null }}
            isDisabled={disabled}
          />
        </div>
      </div>
      {validationMessage && required && (
        <p className="text-red-500 text-xs mt-1 ml-2">{validationMessage}</p>
      )}
    </div>
  );
}
