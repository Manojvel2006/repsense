import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';
import { useWorkoutStore } from '@store/workoutStore';
import { useDeviceStore } from '@store/deviceStore';
import { apiService } from '@services/api';
import { colors, spacing, borderRadius, typography, shadows, theme } from '@theme';
import { scale, verticalScale, responsiveFont, moderateScale } from '@utils/responsive';
import { Ionicons } from '@expo/vector-icons';

type HomeNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user, isAuthenticated, fetchProfile } = useAuthStore();
  const { connectedDevice } = useDeviceStore();
  const [todayStats, setTodayStats] = React.useState({
    reps: 0,
    calories: 0,
    workoutTime: 0,
  });
  const [recentWorkout, setRecentWorkout] = React.useState<{
    exerciseType: string;
    reps: number;
    duration: number;
    date: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      try {
        await fetchProfile();
        const [summary, workoutsRes] = await Promise.all([
          apiService.getSummary(),
          apiService.getWorkouts({ limit: 1 }),
        ]);
        
        setTodayStats({
          reps: summary.totalReps || 0,
          calories: summary.totalCalories || 0,
          workoutTime: summary.totalDuration || 0,
        });
        
        if (workoutsRes.workouts?.length > 0) {
          const w = workoutsRes.workouts[0];
          setRecentWorkout({
            exerciseType: w.exerciseType,
            reps: w.totalReps,
            duration: w.duration,
            date: w.startTime,
          });
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, fetchProfile]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartWorkout = () => {
    navigation.navigate('Workout');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Good morning</Text>
          <Text style={styles.nameText}>{user?.name || 'there'}</Text>
        </View>
        <View style={styles.deviceStatus}>
          <View style={[
            styles.statusDot,
            connectedDevice?.isConnected ? styles.statusConnected : styles.statusDisconnected,
          ]} />
          <Text style={styles.deviceText}>
            {connectedDevice?.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="repeat" size={moderateScale(24)} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{todayStats.reps}</Text>
          <Text style={styles.statLabel}>Today's Reps</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="flame" size={moderateScale(24)} color={colors.accent} />
          </View>
          <Text style={styles.statValue}>{todayStats.calories} kcal</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="time" size={moderateScale(24)} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>{formatDuration(todayStats.workoutTime)}</Text>
          <Text style={styles.statLabel}>Workout Time</Text>
        </View>
      </View>

      {recentWorkout && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workout</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentCard}>
            <View style={styles.recentInfo}>
              <Text style={styles.recentExercise}>{recentWorkout.exerciseType.replace('_', ' ')}</Text>
              <Text style={styles.recentDate}>{formatDate(recentWorkout.date)}</Text>
            </View>
            <View style={styles.recentStats}>
              <View style={styles.recentStat}>
                <Text style={styles.recentStatValue}>{recentWorkout.reps}</Text>
                <Text style={styles.recentStatLabel}>Reps</Text>
              </View>
              <View style={styles.recentStat}>
                <Text style={styles.recentStatValue}>{formatDuration(recentWorkout.duration)}</Text>
                <Text style={styles.recentStatLabel}>Duration</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.startWorkoutButton} onPress={handleStartWorkout} activeOpacity={0.9}>
        <Ionicons name="play-circle" size={moderateScale(28)} color={colors.white} style={styles.startIcon} />
        <Text style={styles.startWorkoutText}>START WORKOUT</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: verticalScale(32),
    maxWidth: theme.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  nameText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: colors.success,
  },
  statusDisconnected: {
    backgroundColor: colors.gray400,
  },
  deviceText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: responsiveFont(20),
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    flexShrink: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  viewAllButton: {
    padding: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  recentCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  recentInfo: {
    marginBottom: spacing.lg,
  },
  recentExercise: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  recentDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recentStat: {
    alignItems: 'center',
  },
  recentStatValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  recentStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: verticalScale(16),
    minHeight: theme.touchTarget + 8,
    ...shadows.md,
  },
  startIcon: {
    marginRight: spacing.xs,
  },
  startWorkoutText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});