import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

const initialState = {
  step1: {
    propertyType: null,
  }
}

const postPropertyFormSlice = createSlice({
  name: 'postPropertyForm',
  initialState,
  reducers: {
    
    setStep1Data: (state, action: PayloadAction<any>) => {
      state.step1 = {...state.step1, propertyType: action.payload.propertyType }
    }
  },
});

export const { setStep1Data } = postPropertyFormSlice.actions;

export const step1Data = (state: RootState) => state.postPropertyForm.step1;

export default postPropertyFormSlice.reducer;

