import { OptionType } from '@/components/common/asyncSelect';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MultiValue } from 'react-select';

interface FormData {
  fullName: string;
  email: string;
  partnerCode: string;
  city: OptionType | null;
  businessSince: string;
  firmName: string;
  about: string;
  profilePreview: string;
  userType: string;
  profilePhoto: File | null;
}

const initialState: FormData = {
  fullName: '',
  email: '',
  partnerCode: '',
  city: null,
  businessSince: '',
  firmName: '',
  about: '',
  profilePreview: '',
  profilePhoto: null,
  userType: 'OWNER'
};

const createAccountSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormField<K extends keyof FormData>(state: any, action: PayloadAction<{ key: K; value: FormData[K] }>) {
      state[action.payload.key] = action.payload.value;
    },
    setFormData(state, action: PayloadAction<FormData>) {
      return action.payload
    },
    resetForm() {
      return initialState;
    },
  },
});

export const { setFormField, setFormData, resetForm } = createAccountSlice.actions;
export default createAccountSlice.reducer;
