export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  formCues: string[];
  isActive: boolean;
}

export type ExerciseType = 
  | 'BICEP_CURL'
  | 'SQUAT'
  | 'PUSH_UP'
  | 'SHOULDER_PRESS'
  | 'LATERAL_RAISE'
  | 'TRICEP_EXTENSION';

export interface SensorData {
  timestamp: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  heartRate: number;
  spo2: number;
  reps: number;
  form: FormStatus;
  exercise: ExerciseType;
}

export type FormStatus = 
  | 'CORRECT_CURL'
  | 'PARTIAL_CURL'
  | 'FAST_CURL'
  | 'INCORRECT_FORM'
  | 'NO_EXERCISE';

export interface WorkoutState {
  isWorkoutActive: boolean;
  isPaused: boolean;
  exercise: ExerciseType | null;
  reps: number;
  correctReps: number;
  partialReps: number;
  fastReps: number;
  incorrectReps: number;
  heartRate: number;
  spo2: number;
  calories: number;
  duration: number;
  formStatus: FormStatus;
  formAccuracy: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface WorkoutSummary {
  exerciseType: ExerciseType;
  duration: number;
  totalReps: number;
  correctReps: number;
  partialReps: number;
  fastReps: number;
  incorrectReps: number;
  formAccuracy: number;
  averageHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  estimatedCalories: number;
}

export interface Workout extends WorkoutSummary {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutListResponse {
  workouts: Workout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalReps: number;
  totalDuration: number;
  totalCalories: number;
  averageFormAccuracy: number;
}

export interface WeeklyAnalytics {
  week: string;
  totalReps: number;
  totalCalories: number;
  totalDuration: number;
  workoutCount: number;
  averageFormAccuracy: number;
}

export interface HeartRateAnalytics {
  date: string;
  averageHeartRate: number;
  maxHeartRate: number;
}

export interface FormAccuracyAnalytics {
  date: string;
  formAccuracy: number;
  totalReps: number;
  correctReps: number;
}

export interface Device {
  id: string;
  name: string;
  batteryLevel?: number;
  signalStrength?: number;
  isConnected: boolean;
  lastConnectedAt?: string;
}

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  advertising: {
    serviceUUIDs?: string[];
    manufacturerData?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}