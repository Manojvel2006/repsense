import { create } from 'zustand';
import { WorkoutState, FormStatus, ExerciseType, SensorData, WorkoutSummary } from '@types';

interface WorkoutStore extends WorkoutState {
  sensorHistory: SensorData[];
  formFeedbackCooldown: number;
  lastFormFeedback: number;
  
  startWorkout: (exercise: ExerciseType) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: () => WorkoutSummary | null;
  resetWorkout: () => void;
  updateFromSensor: (data: SensorData) => void;
  incrementRep: (form: FormStatus) => void;
  updateHeartRate: (hr: number) => void;
  updateSpO2: (spo2: number) => void;
  updateDuration: (duration: number) => void;
  updateCalories: (calories: number) => void;
  setFormFeedbackCooldown: (cooldown: number) => void;
  canShowFormFeedback: () => boolean;
  recordFormFeedback: () => void;
}

const initialState: WorkoutState = {
  isWorkoutActive: false,
  isPaused: false,
  exercise: null,
  reps: 0,
  correctReps: 0,
  partialReps: 0,
  fastReps: 0,
  incorrectReps: 0,
  heartRate: 0,
  spo2: 0,
  calories: 0,
  duration: 0,
  formStatus: 'NO_EXERCISE',
  formAccuracy: 0,
  startTime: null,
  endTime: null,
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  ...initialState,
  sensorHistory: [],
  formFeedbackCooldown: 5000,
  lastFormFeedback: 0,

  startWorkout: (exercise: ExerciseType) => {
    const now = new Date();
    set({
      ...initialState,
      isWorkoutActive: true,
      isPaused: false,
      exercise,
      startTime: now,
      formStatus: 'NO_EXERCISE',
      sensorHistory: [],
      lastFormFeedback: 0,
    });
  },

  pauseWorkout: () => {
    set({ isPaused: true });
  },

  resumeWorkout: () => {
    set({ isPaused: false });
  },

  endWorkout: () => {
    const state = get();
    if (!state.isWorkoutActive || !state.startTime) return null;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - state.startTime.getTime()) / 1000);
    const formAccuracy = state.reps > 0 
      ? Math.round((state.correctReps / state.reps) * 1000) / 10 
      : 0;

    const summary: WorkoutSummary = {
      exerciseType: state.exercise!,
      duration,
      totalReps: state.reps,
      correctReps: state.correctReps,
      partialReps: state.partialReps,
      fastReps: state.fastReps,
      incorrectReps: state.incorrectReps,
      formAccuracy,
      averageHeartRate: state.heartRate,
      maxHeartRate: state.heartRate,
      averageSpO2: state.spo2,
      estimatedCalories: state.calories,
    };

    set({
      isWorkoutActive: false,
      isPaused: false,
      endTime,
      duration,
      formAccuracy,
    });

    return summary;
  },

  resetWorkout: () => {
    set(initialState);
  },

  updateFromSensor: (data: SensorData) => {
    set((state) => ({
      sensorHistory: [...state.sensorHistory.slice(-100), data],
      heartRate: data.heartRate,
      spo2: data.spo2,
      reps: data.reps,
      formStatus: data.form,
    }));
  },

  incrementRep: (form: FormStatus) => {
    set((state) => {
      const newReps = state.reps + 1;
      const updates: Partial<WorkoutState> = {
        reps: newReps,
        formStatus: form,
      };

      switch (form) {
        case 'CORRECT_CURL':
          updates.correctReps = state.correctReps + 1;
          break;
        case 'PARTIAL_CURL':
          updates.partialReps = state.partialReps + 1;
          break;
        case 'FAST_CURL':
          updates.fastReps = state.fastReps + 1;
          break;
        case 'INCORRECT_FORM':
          updates.incorrectReps = state.incorrectReps + 1;
          break;
      }

      return updates;
    });
  },

  updateHeartRate: (heartRate: number) => {
    set({ heartRate });
  },

  updateSpO2: (spo2: number) => {
    set({ spo2 });
  },

  updateDuration: (duration: number) => {
    set({ duration });
  },

  updateCalories: (calories: number) => {
    set({ calories });
  },

  setFormFeedbackCooldown: (cooldown: number) => {
    set({ formFeedbackCooldown: cooldown });
  },

  canShowFormFeedback: () => {
    const state = get();
    return Date.now() - state.lastFormFeedback >= state.formFeedbackCooldown;
  },

  recordFormFeedback: () => {
    set({ lastFormFeedback: Date.now() });
  },
}));