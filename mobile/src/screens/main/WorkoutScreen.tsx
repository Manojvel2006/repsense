import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '@navigation/types';
import { apiService } from '@services/api';
import { Exercise, ExerciseType } from '@types';
import { colors, spacing, borderRadius, typography, shadows, theme } from '@theme';
import { verticalScale, moderateScale, carouselCardWidth } from '@utils/responsive';
import { Ionicons } from '@expo/vector-icons';

type WorkoutNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Workout'>;

const EXERCISE_DATA: Record<ExerciseType, { name: string; icon: string; muscleGroups: string[]; difficulty: 'beginner' | 'intermediate' | 'advanced'; isActive: boolean }> = {
  BICEP_CURL: { name: 'Bicep Curl', icon: 'fitness', muscleGroups: ['Biceps', 'Forearms'], difficulty: 'beginner', isActive: true },
  SQUAT: { name: 'Squat', icon: 'body', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'], difficulty: 'beginner', isActive: false },
  PUSH_UP: { name: 'Push-up', icon: 'fitness', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], difficulty: 'beginner', isActive: false },
  SHOULDER_PRESS: { name: 'Shoulder Press', icon: 'fitness', muscleGroups: ['Shoulders', 'Triceps'], difficulty: 'intermediate', isActive: false },
  LATERAL_RAISE: { name: 'Lateral Raise', icon: 'fitness', muscleGroups: ['Shoulders'], difficulty: 'beginner', isActive: false },
  TRICEP_EXTENSION: { name: 'Tricep Extension', icon: 'fitness', muscleGroups: ['Triceps'], difficulty: 'beginner', isActive: false },
};

export const WorkoutScreen = () => {
  const navigation = useNavigation<WorkoutNavigationProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const response = await apiService.getExercises({ isActive: true });
        setExercises(response.exercises);
      } catch (error) {
        console.error('Failed to load exercises:', error);
        // Fallback to mock data
        setExercises(Object.entries(EXERCISE_DATA).map(([type, data]) => ({
          id: type.toLowerCase(),
          type: type as ExerciseType,
          ...data,
          description: '',
          instructions: [],
          formCues: [],
          createdAt: '',
          updatedAt: '',
        })));
      } finally {
        setIsLoading(false);
      }
    };
    loadExercises();
  }, []);

  const handleStartWorkout = (exerciseType: ExerciseType) => {
    navigation.navigate('LiveWorkout' as any, { exerciseType });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <Text style={styles.loadingText}>Loading exercises...</Text>
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
        <Text style={styles.title}>Select Exercise</Text>
        <Text style={styles.subtitle}>Choose your workout for today</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseScroll}
      >
        {(Object.keys(EXERCISE_DATA) as ExerciseType[]).map((type) => {
          const data = EXERCISE_DATA[type];
          const exercise = exercises.find(e => e.type === type);
          const isActive = data.isActive && (exercise?.isActive !== false);
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.exerciseCard,
                !isActive && styles.exerciseCardDisabled,
              ]}
              onPress={() => isActive ? handleStartWorkout(type) : null}
              activeOpacity={0.8}
              disabled={!isActive}
            >
              <View style={styles.exerciseIcon}>
                <Ionicons name={data.icon as any} size={32} color={isActive ? colors.primary : colors.textTertiary} />
              </View>
              <Text style={[
                styles.exerciseName,
                !isActive && styles.exerciseNameDisabled,
              ]}>
                {data.name}
              </Text>
              {!isActive && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
              <View style={styles.exerciseMeta}>
                <View style={styles.muscleGroup}>
                  {data.muscleGroups.slice(0, 2).map((muscle, i) => (
                    <Text key={i} style={styles.muscleText}>{muscle}</Text>
                  ))}
                </View>
                <View style={styles.difficulty}>
                  <Ionicons name="flash" size={14} color={colors.textTertiary} />
                  <Text style={styles.difficultyText}>{data.difficulty}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={moderateScale(20)} color={colors.primary} />
          <Text style={styles.infoText}>
            More exercises coming soon! Stay tuned for Squats, Push-ups, and more.
          </Text>
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  exerciseScroll: {
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  exerciseCard: {
    width: carouselCardWidth(),
    minHeight: verticalScale(230),
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  exerciseCardDisabled: {
    opacity: 0.6,
    borderColor: colors.border,
  },
  exerciseIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  exerciseNameDisabled: {
    color: colors.textTertiary,
  },
  comingSoonBadge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  exerciseMeta: {
    gap: spacing.sm,
    width: '100%',
  },
  muscleGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  muscleText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficulty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  infoCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryDark,
    flex: 1,
  },
});