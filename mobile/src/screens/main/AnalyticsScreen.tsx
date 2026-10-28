import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { apiService } from '@services/api';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';

type Period = 'week' | 'month' | 'year' | 'all';

export const AnalyticsScreen = () => {
  const [summary, setSummary] = useState<{
    totalWorkouts: number;
    totalReps: number;
    totalDuration: number;
    totalCalories: number;
    averageFormAccuracy: number;
  } | null>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{
    week: string;
    totalReps: number;
    totalCalories: number;
    totalDuration: number;
    workoutCount: number;
  }>>([]);
  const [heartRateData, setHeartRateData] = useState<Array<{
    date: string;
    averageHeartRate: number;
    maxHeartRate: number;
  }>>([]);
  const [formAccuracyData, setFormAccuracyData] = useState<Array<{
    date: string;
    formAccuracy: number;
    totalReps: number;
    correctReps: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Array<{type: string, name: string}>>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(50);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const weeks = period === 'week' ? 1 : period === 'month' ? 4 : period === 'year' ? 52 : 104;
      const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 730;
      
      const [summary, weekly, hr, form, exList] = await Promise.all([
        apiService.getSummary(),
        apiService.getWeeklyAnalytics(weeks),
        apiService.getHeartRateAnalytics(days),
        apiService.getFormAccuracyAnalytics(days),
        apiService.getExercises({ isActive: true }),
      ]);

      setSummary(summary);
      setWeeklyData(weekly);
      setHeartRateData(hr);
      setFormAccuracyData(form);
      if (exList.exercises) {
        setExercises(exList.exercises.map((e: any) => ({ type: e.type, name: e.name })));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const loadExercises = async () => {
    try {
      const response = await apiService.getExercises({ isActive: true });
      if (response.exercises) {
        setExercises(response.exercises.map((e: any) => ({ type: e.type, name: e.name })));
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatWeekLabel = (week: string) => {
    return week.split('-').slice(1).join('-');
  };

  const formatDateLabel = (date: string) => {
    return date.split('-').slice(1).join('-');
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  const weeklyRepsData = {
    labels: weeklyData.map(d => formatWeekLabel(d.week)),
    datasets: [{
      data: weeklyData.map(d => d.totalReps),
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const weeklyCaloriesData = {
    labels: weeklyData.map(d => formatWeekLabel(d.week)),
    datasets: [{
      data: weeklyData.map(d => d.totalCalories),
      color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const hrData = {
    labels: heartRateData.slice(-14).map(d => formatDateLabel(d.date)),
    datasets: [
      {
        data: heartRateData.slice(-14).map(d => d.averageHeartRate),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: heartRateData.slice(-14).map(d => d.maxHeartRate),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity * 0.5})`,
        strokeWidth: 1,
      },
    ],
  };

  const formData = {
    labels: formAccuracyData.slice(-14).map(d => formatDateLabel(d.date)),
    datasets: [{
      data: formAccuracyData.slice(-14).map(d => d.formAccuracy),
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const totalWeeklyReps = weeklyData.reduce((sum, w) => sum + w.totalReps, 0);
  const goalProgress = weeklyGoal > 0 ? Math.min((totalWeeklyReps / weeklyGoal) * 100, 100) : 0;

  const exportCSV = async () => {
    if (!summary) return;
    
    const headers = ['Date', 'Exercise', 'Reps', 'Duration (min)', 'Calories', 'Form Accuracy %', 'Avg HR', 'Max HR', 'Avg SpO2'];
    const workouts = weeklyData.flatMap(w => 
      Array(w.workoutCount).fill(null).map(() => ({
        date: w.week,
        exercise: selectedExercise || 'All',
        reps: Math.round(w.totalReps / Math.max(1, w.workoutCount)),
        duration: Math.round(w.totalDuration / 60 / Math.max(1, w.workoutCount)),
        calories: Math.round(w.totalCalories / Math.max(1, w.workoutCount)),
        accuracy: 'N/A',
        avgHR: 'N/A',
        maxHR: 'N/A',
        spo2: 'N/A',
      }))
    );
    
    const csv = [
      headers.join(','),
      ...workouts.map(w => Object.values(w).join(','))
    ].join('\n');

    try {
      await Share.share({
        title: 'RepSense Analytics Export',
        message: csv,
      });
      Alert.alert('Exported', 'Analytics data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!summary || summary.totalWorkouts === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart" size={64} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Data Yet</Text>
        <Text style={styles.emptySubtitle}>Complete workouts to see your analytics</Text>
        <TouchableOpacity style={styles.emptyAction} onPress={() => {}}>
          <Text style={styles.emptyActionText}>Start Your First Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{getPeriodLabel()}</Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={exportCSV} disabled={isLoading}>
          <Ionicons name="download" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year', 'all'] as Period[]).map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                period === p && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {exercises.length > 1 && (
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Exercise:</Text>
          <View style={styles.exerciseSelector}>
            <TouchableOpacity
              style={[
                styles.exerciseButton,
                !selectedExercise && styles.exerciseButtonActive,
              ]}
              onPress={() => setSelectedExercise(null)}
            >
              <Text style={[
                styles.exerciseButtonText,
                !selectedExercise && styles.exerciseButtonTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {exercises.map(ex => (
              <TouchableOpacity
                key={ex.type}
                style={[
                  styles.exerciseButton,
                  selectedExercise === ex.type && styles.exerciseButtonActive,
                ]}
                onPress={() => setSelectedExercise(ex.type)}
              >
                <Text style={[
                  styles.exerciseButtonText,
                  selectedExercise === ex.type && styles.exerciseButtonTextActive,
                ]}>
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Weekly Rep Goal</Text>
          <TouchableOpacity onPress={() => {
            Alert.prompt(
              'Set Weekly Rep Goal',
              'Enter your weekly rep target:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Set',
                  onPress: (value?: string) => {
                    const num = Number(value);
                    if (!isNaN(num) && num > 0) {
                      setWeeklyGoal(num);
                    }
                  },
                },
              ],
              'plain-text',
              weeklyGoal.toString()
            );
          }}>
            <Ionicons name="create" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <View style={styles.goalProgress}>
          <Text style={styles.goalValue}>{totalWeeklyReps} / {weeklyGoal} reps</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${goalProgress}%`, backgroundColor: goalProgress >= 100 ? colors.success : colors.primary },
              ]}
            />
          </View>
          <Text style={styles.goalPercent}>{goalProgress.toFixed(0)}% complete</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🏋️</Text>
          <Text style={styles.summaryValue}>{summary.totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>Total Workouts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🔁</Text>
          <Text style={styles.summaryValue}>{summary.totalReps.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Reps</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>⏱</Text>
          <Text style={styles.summaryValue}>{formatDuration(summary.totalDuration)}</Text>
          <Text style={styles.summaryLabel}>Total Time</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🔥</Text>
          <Text style={styles.summaryValue}>{summary.totalCalories.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Calories</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🎯</Text>
          <Text style={styles.summaryValue}>{summary.averageFormAccuracy.toFixed(1)}%</Text>
          <Text style={styles.summaryLabel}>Avg Accuracy</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Reps</Text>
        <LineChart
          data={weeklyRepsData}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            style: {
              borderRadius: borderRadius.lg,
            },
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Calories</Text>
        // @ts-ignore
        <BarChart
          data={weeklyCaloriesData}
          width={350}
          height={200}
          yAxisLabel="kcal"
          yAxisSuffix=" kcal"
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
            style: {
              borderRadius: borderRadius.lg,
            },
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Heart Rate (Last 14 Days)</Text>
        <LineChart
          data={hrData}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            style: {
              borderRadius: borderRadius.lg,
            },
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Form Accuracy (Last 14 Days)</Text>
        <LineChart
          data={formData}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            style: {
              borderRadius: borderRadius.lg,
            },
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  emptyAction: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyActionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
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
  exportButton: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  filterRow: {
    marginBottom: spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  exerciseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  exerciseButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exerciseButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  exerciseButtonTextActive: {
    color: colors.white,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  goalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  goalProgress: {
    gap: spacing.sm,
  },
  goalValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalPercent: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  summaryIcon: {
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
});