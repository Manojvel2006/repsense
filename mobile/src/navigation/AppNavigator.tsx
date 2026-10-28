import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainTabs } from './MainTabs';
import { LiveWorkoutScreen } from '@screens/workout/LiveWorkoutScreen';
import { WorkoutSummaryScreen } from '@screens/workout/WorkoutSummaryScreen';
import { WorkoutDetailScreen } from '@screens/workout/WorkoutDetailScreen';
import { apiService } from '@services/api';
import { notificationService } from '@services/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, token, fetchProfile } = useAuthStore();

  React.useEffect(() => {
    const init = async () => {
      try {
        await apiService.initialize();
      } catch (e) {
        console.warn('apiService.initialize failed (non-fatal):', e);
      }
      try {
        await notificationService.initialize();
      } catch (e) {
        console.warn('notificationService.initialize failed (non-fatal):', e);
      }
      
      if (token) {
        try {
          useAuthStore.getState().setAuth({ accessToken: token });
          await fetchProfile();
        } catch (e) {
          console.warn('fetchProfile failed (non-fatal):', e);
        }
      }
    };
    init();
  }, [token]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="LiveWorkout" component={LiveWorkoutScreen} />
            <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
            <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="Onboarding" component={OnboardingStack} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};