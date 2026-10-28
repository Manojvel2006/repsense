import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import { HomeScreen } from '@screens/main/HomeScreen';
import { WorkoutScreen } from '@screens/main/WorkoutScreen';
import { HistoryScreen } from '@screens/main/HistoryScreen';
import { AnalyticsScreen } from '@screens/main/AnalyticsScreen';
import { ProfileScreen } from '@screens/main/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@theme';
import { responsiveFont, scale, verticalScale } from '@utils/responsive';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const insets = useSafeAreaInsets();
  // Nord 5 uses gesture nav: bottom inset is ~16-24dp. Keep bar compact
  // but never clip labels; min 60dp total height for 48dp touch targets.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const barHeight = verticalScale(60) + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Workout':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: barHeight,
          paddingBottom: bottomInset,
          paddingTop: scale(6),
        },
        tabBarLabelStyle: {
          fontSize: responsiveFont(12),
          fontWeight: '500' as const,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          minHeight: 48,
          paddingVertical: 4,
        },
        tabBarAllowFontScaling: true,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
