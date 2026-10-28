import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { RegisterScreen } from '@screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <AuthStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
  );
};