'use client';

import { MuiOtpInput, MuiOtpInputProps } from 'mui-one-time-password-input';
import { styled } from '@mui/material/styles';
import React from 'react';

const StyledMuiOtpInput = styled(MuiOtpInput)(({ theme }) => ({
  display: 'flex',
  gap: '16px',

  '& .MuiInputBase-root': {
    width: '64px',
    height: '64px',
    fontSize: '24px',
    fontWeight: 500,
    textAlign: 'center',
    borderRadius: '12px',
    border: '2px solid var(--color-border)',
    backgroundColor: '#fff',
    padding: 0,
    transition: 'all 0.2s ease',
    boxShadow: 'none',

    [theme.breakpoints.down('lg')]: {
      width: '48px',
      height: '48px',
      fontSize: '18px',
      borderRadius: '10px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '38px',
      height: '38px',
      fontSize: '18px',
      borderRadius: '8px',
    },

    '&:hover': {
      borderColor: '#ccc',
    },
    '&.Mui-focused': {
      borderColor: 'var(--color-blue)',
      boxShadow: '0 0 0 0.5px var(--color-blue)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },

  '& input': {
    textAlign: 'center',
    padding: 0,
    height: '100%',
    color: 'var(--color-text-black)',
    fontSize: '24px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '18px',
    },
  },
}));

export interface OtpInputProps extends MuiOtpInputProps {
  className?: string;
}

const OtpInput: React.FC<OtpInputProps> = (props) => {
  return (
    <StyledMuiOtpInput
      TextFieldsProps={{ size: 'small', type: "tel", inputMode: "numeric" }}
      autoFocus={true}
      {...props}
    />
  );
};

export default OtpInput;
