import { POST_PROPERTY_STEPS } from '@/lib/enums';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface step {
    number: number;
    title: string;
    desc: string;
    status: string;
}
interface Progress {
  step_1_Progress: number | null;
  step_2_Progress: number | null;
  step_3_Progress: number | null;
  step_4_Progress: number | null;
  totalProgress: number;
  stepList: step[];
  activeStep: number
}

const initialState: Progress = {
  step_1_Progress: null,
  step_2_Progress: null,
  step_3_Progress: null,
  step_4_Progress: null,
  totalProgress: 0,
  stepList: POST_PROPERTY_STEPS,
  activeStep: 1
};

const postPropertyProgressSlice = createSlice({
  name: 'postPropertyProgress',
  initialState,
  reducers: {
    // Update individual step progress
    updateStepProgress: (
      state,
      action: PayloadAction<{ step: number; progress: number }>
    ) => {
      const { step, progress } = action.payload;
      
      switch (step) {
        case 1:
          state.step_1_Progress = progress;
          break;
        case 2:
          state.step_2_Progress = progress;
          break;
        case 3:
          state.step_3_Progress = progress;
          break;
        case 4:
          state.step_4_Progress = progress;
          break;
        default:
          console.warn(`Invalid step: ${step}`);
      }

      // Recalculate total each time a step is updated
      const allSteps = [
        state.step_1_Progress,
        state.step_2_Progress,
        state.step_3_Progress,
        state.step_4_Progress,
      ].filter((v): v is number => v !== null);

      state.totalProgress =
        allSteps.length > 0
          ? Math.round(allSteps.reduce((a, b) => a + b, 0))
          : 0;
    },

    
    calculateTotalProgress: (state) => {
      const allSteps = [
        state.step_1_Progress,
        state.step_2_Progress,
        state.step_3_Progress,
        state.step_4_Progress,
      ].filter((v): v is number => v !== null);

      state.totalProgress =
        allSteps.length > 0
          ? Math.round(allSteps.reduce((a, b) => a + b, 0) / allSteps.length)
          : 0;
    },

    // Reset all progress values
    resetProgress: (state) => {
      state.step_1_Progress = null;
      state.step_2_Progress = null;
      state.step_3_Progress = null;
      state.step_4_Progress = null;
      state.totalProgress = 0;
    },

    setActiveStep: (
      state,
      action: PayloadAction<{step: number}>
    ) => {
      const { step } = action.payload;
      state.activeStep = step
    },

    setTotalProgress: ( state,
      action: PayloadAction<{progress: number }>) => {
        state.totalProgress = action.payload.progress
    },
  },
});

export const {
  updateStepProgress,
  calculateTotalProgress,
  resetProgress,
  setActiveStep,
  setTotalProgress,
} = postPropertyProgressSlice.actions;

export default postPropertyProgressSlice.reducer;

// Selectors
export const selectStepProgress = (state: Progress, step: number) => {
  switch (step) {
    case 1:
      return state.step_1_Progress;
    case 2:
      return state.step_2_Progress;
    case 3:
      return state.step_3_Progress;
    case 4:
      return state.step_4_Progress;
    default:
      return null;
  }
};

export const selectTotalProgress = (state: Progress) => state.totalProgress;
export const getStepList = (state: RootState) => state.postPropertyProgress.stepList;
export const getActiveStep = (state: RootState) => state.postPropertyProgress.activeStep;
