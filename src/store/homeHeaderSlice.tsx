import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface HeaderState {
  selectedCity: { id: string; name: string; [key: string]: unknown } | null;
  aboutsUsData: unknown;
  cityData: { allCities?: unknown[]; featuredCities?: unknown[]; [key: string]: unknown } | null;
  cityLoader: boolean;
  propertyMasterData: unknown[];
  userRole: string | null;
}

const initialState: HeaderState = {
  selectedCity: null,
  aboutsUsData: null,
  cityData: null,
  cityLoader: false,
  propertyMasterData: [],
  userRole: null,
};

const homeHeaderSlice = createSlice({
  name: 'homeHeader',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<HeaderState['selectedCity']>) => {
      state.selectedCity = action.payload;
    },
    setAboutusData: (state, action: PayloadAction<unknown>) => {
      state.aboutsUsData = action.payload;
    },
    setCityData: (state, action: PayloadAction<HeaderState['cityData']>) => {
      state.cityData = action.payload;
    },
    setCityLoader: (state, action: PayloadAction<boolean>) => {
      state.cityLoader = action.payload;
    },
    setPropertyMasterData: (state, action: PayloadAction<unknown[]>) => {
      state.propertyMasterData = action.payload ?? [];
    },
    setUserRole: (state, action: PayloadAction<string | null>) => {
      state.userRole = action.payload;
    },
  },
});

export const {
  setSelectedCity,
  setAboutusData,
  setCityData,
  setCityLoader,
  setPropertyMasterData,
  setUserRole,
} = homeHeaderSlice.actions;

export const getSelectedCity = (state: RootState) => state.homeHeader.selectedCity;
export const getAboutusData = (state: RootState) => state.homeHeader.aboutsUsData;
export const getCityData = (state: RootState) => state.homeHeader.cityData;
export const getCityLoader = (state: RootState) => state.homeHeader.cityLoader;
export const getPropertyMasterData = (state: RootState) => state.homeHeader.propertyMasterData;
export const getUserRole = (state: RootState) => state.homeHeader.userRole;

export default homeHeaderSlice.reducer;

