import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { apiService } from '@services/api';
import { Workout } from '@types';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { RouteProp } from '@react-navigation/native';

type DetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutDetail'>;
type DetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

export const WorkoutDetailScreen = () => {
  const navigation = useNavigation<DetailNavigationProp>();
  const route = useRoute<DetailRouteProp>();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hrData, setHrData] = useState<Array<{ time: number; hr: number }>>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadWorkout = async () => {
      const params = route.params as { workout?: Workout; workoutId?: string };
      
      if (params?.workout) {
        setWorkout(params.workout);
        generateMockHRData(params.workout);
        setIsLoading(false);
      } else if (params?.workoutId) {
        try {
          const workoutData = await apiService.getWorkout(params.workoutId);
          if (workoutData) {
            setWorkout(workoutData);
            generateMockHRData(workoutData);
          }
        } catch (error) {
          console.error('Failed to load workout:', error);
          Alert.alert('Error', 'Failed to load workout details');
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      } else {
        navigation.goBack();
      }
    };
    
    loadWorkout();
  }, [route.params, navigation]);

  const generateMockHRData = (w: Workout) => {
    const dataPoints = Math.max(10, Math.floor(w.duration / 30));
    const data = [];
    let currentHR = Math.max(60, w.averageHeartRate - 20);
    
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);
      const targetHR = w.averageHeartRate + (w.maxHeartRate - w.averageHeartRate) * Math.sin(progress * Math.PI);
      currentHR = currentHR * 0.7 + targetHR * 0.3 + (Math.random() - 0.5) * 8;
      data.push({
        time: (w.duration * progress) / 60,
        hr: Math.round(Math.max(50, Math.min(200, currentHR))),
      });
    }
    setHrData(data);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const handleDelete = () => {
    if (!workout) return;
    
    Alert.alert(
      'Delete Workout?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          setIsDeleting(true);
          try {
            await apiService.deleteWorkout(workout.id);
            Alert.alert('Deleted', 'Workout removed successfully', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } catch (error) {
            console.error('Failed to delete workout:', error);
            Alert.alert('Error', 'Failed to delete workout');
          } finally {
            setIsDeleting(false);
          }
        }},
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Workout not found</Text>
      </View>
    );
  }

  const hrChartData = {
    labels: hrData.map(d => `${d.time.toFixed(1)}m`),
    datasets: [{
      data: hrData.map(d => d.hr),
      color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.exerciseType.replace('_', ' ')}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} disabled={isDeleting}>
          <Ionicons name="trash" size={24} color={isDeleting ? colors.textTertiary : colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryDate}>{formatDate(workout.startTime)}</Text>
        <View style={styles.primaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.totalReps}</Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.formAccuracy.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Form Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.estimatedCalories} kcal</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Rep Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <View style={[styles.breakdownItem, { borderColor: colors.success }]}>
            <Text style={{ color: colors.success, ...styles.breakdownValue }}>{workout.correctReps}</Text>
            <Text style={styles.breakdownLabel}>Correct</Text>
            <Text style={styles.breakdownPercent}>{workout.totalReps > 0 ? Math.round((workout.correctReps / workout.totalReps) * 100) : 0}%</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.warning }]}>
            <Text style={{ color: colors.warning, ...styles.breakdownValue }}>{workout.partialReps}</Text>
            <Text style={styles.breakdownLabel}>Partial</Text>
            <Text style={styles.breakdownPercent}>{workout.totalReps > 0 ? Math.round((workout.partialReps / workout.totalReps) * 100) : 0}%</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.accent }]}>
            <Text style={{ color: colors.accent, ...styles.breakdownValue }}>{workout.fastReps}</Text>
            <Text style={styles.breakdownLabel}>Fast</Text>
            <Text style={styles.breakdownPercent}>{workout.totalReps > 0 ? Math.round((workout.fastReps / workout.totalReps) * 100) : 0}%</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.error }]}>
            <Text style={{ color: colors.error, ...styles.breakdownValue }}>{workout.incorrectReps}</Text>
            <Text style={styles.breakdownLabel}>Incorrect</Text>
            <Text style={styles.breakdownPercent}>{workout.totalReps > 0 ? Math.round((workout.incorrectReps / workout.totalReps) * 100) : 0}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Heart Rate</Text>
        <View style={styles.hrStats}>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>{workout.averageHeartRate}</Text>
            <Text style={styles.hrLabel}>Avg BPM</Text>
          </View>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>{workout.maxHeartRate}</Text>
            <Text style={styles.hrLabel}>Max BPM</Text>
          </View>
          <View style={styles.hrStat}>
            <Text style={styles.hrValue}>{workout.averageSpO2}%</Text>
            <Text style={styles.hrLabel}>Avg SpO₂</Text>
          </View>
        </View>
        {hrData.length > 0 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={hrChartData}
              width={350}
              height={200}
              chartConfig={{
                backgroundColor: colors.background,
                backgroundGradientFrom: colors.background,
                backgroundGradientTo: colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                style: { borderRadius: borderRadius.lg },
              }}
              style={styles.chart}
            />
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Calories Burned</Text>
        <Text style={styles.caloriesValue}>{workout.estimatedCalories} kcal</Text>
      </View>

      {workout.synced !== undefined && (
        <View style={styles.syncStatus}>
          <Ionicons name={workout.synced ? 'checkmark-circle' : 'cloud-offline'} size={20} color={workout.synced ? colors.success : colors.warning} />
          <Text style={styles.syncText}>
            {workout.synced ? 'Synced to cloud' : 'Pending sync'}
          </Text>
        </View>
      )}
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
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  summaryDate: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
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
    minWidth: 60,
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
  breakdownPercent: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  hrStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  hrStat: {
    alignItems: 'center',
  },
  hrValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hrLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  chartContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  caloriesValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    textAlign: 'center',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  syncText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});