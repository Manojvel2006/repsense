import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import { apiService } from '@services/api';
import { Workout } from '@types';
import { colors, spacing, borderRadius, typography, shadows, theme } from '@theme';
import { verticalScale } from '@utils/responsive';
import { Ionicons } from '@expo/vector-icons';

type HistoryNavigationProp = NavigationProp<RootStackParamList>;

export const HistoryScreen = () => {
  const navigation = useNavigation<HistoryNavigationProp>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const loadWorkouts = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      const response = await apiService.getWorkouts({ page: pageNum, limit: 20 });
      const newWorkouts = response.workouts as Workout[];
      if (refresh || pageNum === 1) {
        setWorkouts(newWorkouts);
      } else {
        setWorkouts(prev => [...prev, ...newWorkouts]);
      }
      setTotal(response.total);
      setHasMore(newWorkouts.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts(1, true);
  };

  const onEndReached = () => {
    if (hasMore && !isLoading) {
      loadWorkouts(page + 1);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getFormAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return colors.success;
    if (accuracy >= 60) return colors.warning;
    return colors.error;
  };

  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
      activeOpacity={0.8}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutMain}>
          <Text style={styles.workoutExercise}>{item.exerciseType.replace('_', ' ')}</Text>
          <Text style={styles.workoutDate}>{formatDate(item.startTime)}</Text>
        </View>
        <View style={styles.workoutAccuracy}>
          <Text style={[
            styles.accuracyValue,
            { color: getFormAccuracyColor(item.formAccuracy) },
          ]}>
            {item.formAccuracy.toFixed(1)}%
          </Text>
          <Text style={styles.accuracyLabel}>Form</Text>
        </View>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalReps}</Text>
          <Text style={styles.statLabel}>Reps</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.estimatedCalories} kcal</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      <View style={styles.repBreakdown}>
        <View style={styles.repItem}>
          <View style={[styles.repDot, { backgroundColor: colors.success }]} />
          <Text style={styles.repText}>Correct: {item.correctReps}</Text>
        </View>
        <View style={styles.repItem}>
          <View style={[styles.repDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.repText}>Partial: {item.partialReps}</Text>
        </View>
        <View style={styles.repItem}>
          <View style={[styles.repDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.repText}>Fast: {item.fastReps}</Text>
        </View>
        <View style={styles.repItem}>
          <View style={[styles.repDot, { backgroundColor: colors.error }]} />
          <Text style={styles.repText}>Incorrect: {item.incorrectReps}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptySubtitle}>Start your first workout to see history here</Text>
    </View>
  );

  if (isLoading && workouts.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>Workout History</Text>
        <Text style={styles.subtitle}>{total} workouts total</Text>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={workouts.length === 0 ? renderEmpty : null}
      />
    </View>
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
    maxWidth: theme.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  workoutMain: {
    flex: 1,
  },
  workoutExercise: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  workoutDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  workoutAccuracy: {
    alignItems: 'flex-end',
  },
  accuracyValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  accuracyLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  repBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  repItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  repDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  repText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});