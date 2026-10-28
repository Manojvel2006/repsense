import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { ProfileSetupScreen } from '@screens/onboarding/ProfileSetupScreen';
import { ConnectDeviceScreen } from '@screens/onboarding/ConnectDeviceScreen';

const OnboardingStackNav = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack = () => {
  return (
    <OnboardingStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <OnboardingStackNav.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <OnboardingStackNav.Screen name="ConnectDevice" component={ConnectDeviceScreen} />
    </OnboardingStackNav.Navigator>
  );
};