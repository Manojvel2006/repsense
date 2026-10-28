import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { getBleService } from '@services/ble';
import { useWorkoutStore } from '@store/workoutStore';
import { useDeviceStore } from '@store/deviceStore';
import { colors, spacing, borderRadius, typography, shadows, theme } from '@theme';
import { scale, verticalScale, responsiveFont, moderateScale } from '@utils/responsive';
import { Ionicons } from '@expo/vector-icons';

import { RouteProp } from '@react-navigation/native';

type LiveWorkoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveWorkout'>;
type LiveWorkoutRouteProp = RouteProp<RootStackParamList, 'LiveWorkout'>;

const FORM_MESSAGES: Record<string, string> = {
  CORRECT_CURL: 'Great job! Correct form.',
  PARTIAL_CURL: 'Complete the full movement.',
  FAST_CURL: 'Slow down and control your movement.',
  INCORRECT_FORM: 'Incorrect form detected.',
  NO_EXERCISE: 'Waiting for movement...',
};

const MILESTONES = [10, 20, 30, 50, 100];

export const LiveWorkoutScreen = () => {
  const navigation = useNavigation<LiveWorkoutNavigationProp>();
  const route = useRoute<LiveWorkoutRouteProp>();
  const { exerciseType = 'BICEP_CURL' } = route.params || {};
  
  const { 
    isWorkoutActive, 
    isPaused, 
    reps, 
    correctReps, 
    partialReps, 
    fastReps, 
    incorrectReps,
    heartRate, 
    spo2, 
    calories, 
    duration, 
    formStatus,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    endWorkout,
    updateDuration,
    updateCalories,
    canShowFormFeedback,
    recordFormFeedback,
  } = useWorkoutStore();

  const { connectedDevice, setConnectionState } = useDeviceStore();
  const bleService = getBleService();
  
  const lastRepCountRef = useRef(0);
  const lastFormFeedbackRef = useRef<string>('');
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const caloriesIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!isWorkoutActive) {
      startWorkout(exerciseType as any);
    }

    const ble = getBleService();
    ble.initialize();

    const unsubSensor = ble.subscribeToSensorData((data) => {
      useWorkoutStore.getState().updateFromSensor(data);
      
      if (data.reps > lastRepCountRef.current) {
        useWorkoutStore.getState().incrementRep(data.form);
        lastRepCountRef.current = data.reps;
        triggerHaptic('light');
      }
    });

    const unsubState = ble.subscribeToConnectionState((state) => {
      setConnectionState(state);
    });

    if (connectedDevice?.isConnected) {
      ble.connect(connectedDevice.id);
    }

    durationIntervalRef.current = setInterval(() => {
      updateDuration(Date.now() - (useWorkoutStore.getState().startTime?.getTime() || Date.now()));
    }, 1000);

    caloriesIntervalRef.current = setInterval(() => {
      const hr = useWorkoutStore.getState().heartRate;
      const weight = 70; // TODO: get from user profile
      const calPerMin = (hr * 0.6309 * weight) / 60;
      updateCalories(calPerMin / 60);
    }, 1000);

    return () => {
      unsubSensor();
      unsubState();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (caloriesIntervalRef.current) clearInterval(caloriesIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (reps > 0 && reps !== lastRepCountRef.current) {
      if (MILESTONES.includes(reps)) {
        showToast(`Great job! ${reps} reps completed!`);
      }
      lastRepCountRef.current = reps;
    }
  }, [reps]);

  useEffect(() => {
    if (formStatus !== 'NO_EXERCISE' && formStatus !== 'CORRECT_CURL' && formStatus !== lastFormFeedbackRef.current) {
      if (canShowFormFeedback()) {
        showToast(FORM_MESSAGES[formStatus] || FORM_MESSAGES.NO_EXERCISE);
        recordFormFeedback();
        lastFormFeedbackRef.current = formStatus;
      }
    } else if (formStatus === 'CORRECT_CURL') {
      lastFormFeedbackRef.current = '';
    }
  }, [formStatus, canShowFormFeedback]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    if (isPaused) {
      resumeWorkout();
    } else {
      pauseWorkout();
    }
  };

  const handleEnd = () => {
    Alert.alert(
      'End Workout?',
      'Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', style: 'destructive', onPress: () => {
          const summary = endWorkout();
          if (summary) {
            navigation.navigate('WorkoutSummary', { summary });
          }
        }},
      ]
    );
  };

  const showToast = (message: string) => {
    // TODO: Replace with actual toast library (react-native-toast-message)
    console.log('TOAST:', message);
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    // TODO: Implement with expo-haptics or react-native-haptic-feedback
    if (Platform.OS === 'web') return;
  };

  const getFormColor = (form: string) => {
    switch (form) {
      case 'CORRECT_CURL': return colors.success;
      case 'PARTIAL_CURL': return colors.warning;
      case 'FAST_CURL': return colors.accent;
      case 'INCORRECT_FORM': return colors.error;
      default: return colors.textTertiary;
    }
  };

  const getFormIcon = (form: string) => {
    switch (form) {
      case 'CORRECT_CURL': return 'checkmark-circle';
      case 'PARTIAL_CURL': return 'alert-circle';
      case 'FAST_CURL': return 'speedometer';
      case 'INCORRECT_FORM': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.exerciseName} numberOfLines={1}>{exerciseType?.replace('_', ' ')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePause}
            activeOpacity={0.8}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={moderateScale(24)} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.endButton]}
            onPress={handleEnd}
            activeOpacity={0.8}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="End workout"
          >
            <Ionicons name="stop" size={moderateScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.repContainer}>
        <Text style={styles.repLabel}>REPS</Text>
        <Text style={styles.repCount} adjustsFontSizeToFit numberOfLines={1}>{reps}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={[styles.formBadge, { backgroundColor: getFormColor(formStatus) }]}>
          <Ionicons name={getFormIcon(formStatus)} size={moderateScale(20)} color={colors.white} />
          <Text style={styles.formText} numberOfLines={1}>{formStatus.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.vitalsGrid}>
        <View style={styles.vitalCard}>
          <Ionicons name="heart" size={moderateScale(24)} color={colors.error} />
          <Text style={styles.vitalValue} adjustsFontSizeToFit numberOfLines={1}>{heartRate}</Text>
          <Text style={styles.vitalLabel}>BPM</Text>
        </View>
        <View style={styles.vitalCard}>
          <Ionicons name="water" size={moderateScale(24)} color={colors.primary} />
          <Text style={styles.vitalValue} adjustsFontSizeToFit numberOfLines={1}>{spo2}%</Text>
          <Text style={styles.vitalLabel}>SpO₂</Text>
        </View>
        <View style={styles.vitalCard}>
          <Ionicons name="time" size={moderateScale(24)} color={colors.secondary} />
          <Text style={styles.vitalValue} adjustsFontSizeToFit numberOfLines={1}>{formatDuration(duration)}</Text>
          <Text style={styles.vitalLabel}>Duration</Text>
        </View>
        <View style={styles.vitalCard}>
          <Ionicons name="flame" size={moderateScale(24)} color={colors.accent} />
          <Text style={styles.vitalValue} adjustsFontSizeToFit numberOfLines={1}>{Math.round(calories)}</Text>
          <Text style={styles.vitalLabel}>kcal</Text>
        </View>
      </View>

      <View style={styles.repBreakdown}>
        <Text style={styles.breakdownTitle}>Rep Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <View style={[styles.breakdownItem, { borderColor: colors.success }]}>
            <Text style={{ color: colors.success, ...styles.breakdownValue }}>{correctReps}</Text>
            <Text style={styles.breakdownLabel}>Correct</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.warning }]}>
            <Text style={{ color: colors.warning, ...styles.breakdownValue }}>{partialReps}</Text>
            <Text style={styles.breakdownLabel}>Partial</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.accent }]}>
            <Text style={{ color: colors.accent, ...styles.breakdownValue }}>{fastReps}</Text>
            <Text style={styles.breakdownLabel}>Fast</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.error }]}>
            <Text style={{ color: colors.error, ...styles.breakdownValue }}>{incorrectReps}</Text>
            <Text style={styles.breakdownLabel}>Incorrect</Text>
          </View>
        </View>
      </View>
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
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: theme.touchTarget,
  },
  exerciseName: {
    flex: 1,
    flexShrink: 1,
    marginRight: spacing.md,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    flexShrink: 0,
  },
  actionButton: {
    width: Math.max(scale(50), theme.touchTarget),
    height: Math.max(scale(50), theme.touchTarget),
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  endButton: {
    backgroundColor: colors.error,
  },
  repContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: verticalScale(140),
    justifyContent: 'center',
  },
  repLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  repCount: {
    fontSize: responsiveFont(88, 1.1),
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: responsiveFont(96, 1.1),
    textAlign: 'center',
    includeFontPadding: false,
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  formBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  formText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  vitalCard: {
    flex: 1,
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: scale(150),
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  vitalValue: {
    fontSize: responsiveFont(24),
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  vitalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  repBreakdown: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  breakdownTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
  },
  breakdownValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  breakdownLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});