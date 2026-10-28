export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProfileSetup: undefined;
  ConnectDevice: undefined;
  ExerciseSelection: undefined;
  LiveWorkout: { exerciseType: string } | undefined;
  WorkoutSummary: { summary: object } | undefined;
  WorkoutDetail: { workout: any } | { workoutId: string } | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  ProfileSetup: undefined;
  ConnectDevice: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workout: undefined;
  History: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type WorkoutStackParamList = {
  ExerciseSelection: undefined;
  LiveWorkout: { exerciseType: string } | undefined;
  WorkoutSummary: { summary: object } | undefined;
};