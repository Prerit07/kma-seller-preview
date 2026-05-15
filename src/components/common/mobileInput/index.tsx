'use client';

import { useMemo } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { InputBase } from '@mui/material';
import clsx from 'clsx';

interface OptionType {
  value: string;
  label: string;
}

interface MobileInputProps {
  placeHolder?: string;
  value?: string;
  onChange?: (value: string, countryCode: string) => void;
  required?: boolean;
  validationMessage?: string;
  countryCode?: string;
  disabled?: boolean;
}

const countryOptions: OptionType[] = [
  { value: '+91', label: '+91' },
  { value: '+1', label: '+1' },
  { value: '+44', label: '+44' },
  { value: '+61', label: '+61' },
];

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
    minWidth: '65px',
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
    color: '#000',
    fontWeight: 500,
  }),
  menu: (base) => ({
    ...base,
    width: '200px',
    marginTop: '18px',
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

export default function MobileInput({
  placeHolder = 'Enter your mobile number',
  validationMessage = '',
  value = '',
  onChange,
  required = false,
  countryCode = countryOptions[0]?.value ?? '',
  disabled = false,
}: MobileInputProps) {
    const mobileNumber = useMemo(() => {
    return value
  }, [value])

  const selectedCountryCode = useMemo(() => {
    return countryOptions.find(option => option.value === countryCode)
  },[countryCode])

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const isOnlyDigits = /^\d*$/.test(input);
    if (!isOnlyDigits) return;
    if (input.length > 10) return;
    if (onChange) {
      onChange(input, countryCode);
    }
  };

  const handleCountryChange = (selected: SingleValue<OptionType>) => {
    if (selected) {
      if (onChange) {
        onChange(mobileNumber, selected.value);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        className={clsx(
          'flex items-center w-full border rounded-full transition-all',
          validationMessage && required ? 'border-red-500' : 'border-border',
          disabled && 'bg-gray-100 opacity-70 cursor-not-allowed'
        )}
      >
        <div className="px-2 flex items-center">
          {/* <Select
            instanceId="country-select"
            options={countryOptions}
            value={selectedCountryCode}
            styles={customSelectStyles}
            isSearchable={false}
            onChange={handleCountryChange}
            components={{ IndicatorSeparator: () => null }}
            isDisabled={disabled}
          /> */}
          <p className='w-[50px] pl-2 text-text-black'>+ 91</p>
        </div>

        <InputBase
          placeholder={placeHolder}
          fullWidth
          value={mobileNumber ?? ''}
          onChange={handleMobileChange}
          disabled={disabled}
          className="px-4 py-2 text-gray text-sm border-l border-gray-300"
          inputProps={{
            className: 'placeholder-gray outline-none',
          }}
        />
      </div>
      {validationMessage && required && (
        <p className="text-red-500 text-xs mt-1 ml-2">{validationMessage}</p>
      )}
    </div>
  );
}
