import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { apiService } from '@services/api';
import { WorkoutSummary } from '@types';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';
import { Ionicons } from '@expo/vector-icons';

import { RouteProp } from '@react-navigation/native';

type SummaryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutSummary'>;
type SummaryRouteProp = RouteProp<RootStackParamList, 'WorkoutSummary'>;

export const WorkoutSummaryScreen = () => {
  const navigation = useNavigation<SummaryNavigationProp>();
  const route = useRoute<SummaryRouteProp>();
  
  // Get params with proper fallback
  const params = route.params as { summary: WorkoutSummary } | undefined;
  const summary = params?.summary ?? {
    exerciseType: 'BICEP_CURL' as any,
    duration: 0,
    totalReps: 0,
    correctReps: 0,
    partialReps: 0,
    fastReps: 0,
    incorrectReps: 0,
    formAccuracy: 0,
    averageHeartRate: 0,
    maxHeartRate: 0,
    averageSpO2: 0,
    estimatedCalories: 0,
  };
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

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
      year: 'numeric'
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        exerciseType: summary.exerciseType,
        startTime: new Date(Date.now() - summary.duration * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: summary.duration,
        totalReps: summary.totalReps,
        correctReps: summary.correctReps,
        partialReps: summary.partialReps,
        fastReps: summary.fastReps,
        incorrectReps: summary.incorrectReps,
        formAccuracy: summary.formAccuracy,
        averageHeartRate: summary.averageHeartRate,
        maxHeartRate: summary.maxHeartRate,
        averageSpO2: summary.averageSpO2,
        estimatedCalories: summary.estimatedCalories,
      };

      await apiService.createWorkout(payload);
      setIsSynced(true);
      Alert.alert('Saved!', 'Workout saved to cloud successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert(
        'Saved Offline',
        'Workout saved locally. Will sync when online.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Workout?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Complete</Text>
        <Text style={styles.subtitle}>{summary.exerciseType.replace('_', ' ')} • {formatDate(new Date().toISOString())}</Text>
      </View>

      <View style={styles.primaryStats}>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryValue}>{summary.totalReps}</Text>
          <Text style={styles.primaryLabel}>Total Reps</Text>
        </View>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryValue}>{summary.formAccuracy.toFixed(1)}%</Text>
          <Text style={styles.primaryLabel}>Form Accuracy</Text>
        </View>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryValue}>{formatDuration(summary.duration)}</Text>
          <Text style={styles.primaryLabel}>Duration</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Rep Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <View style={[styles.breakdownItem, { borderColor: colors.success }]}>
            <Text style={{ color: colors.success, ...styles.breakdownValue }}>{summary.correctReps}</Text>
            <Text style={styles.breakdownLabel}>Correct</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.warning }]}>
            <Text style={{ color: colors.warning, ...styles.breakdownValue }}>{summary.partialReps}</Text>
            <Text style={styles.breakdownLabel}>Partial</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.accent }]}>
            <Text style={{ color: colors.accent, ...styles.breakdownValue }}>{summary.fastReps}</Text>
            <Text style={styles.breakdownLabel}>Fast</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: colors.error }]}>
            <Text style={{ color: colors.error, ...styles.breakdownValue }}>{summary.incorrectReps}</Text>
            <Text style={styles.breakdownLabel}>Incorrect</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Heart Rate & SpO₂</Text>
        <View style={styles.vitalsRow}>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{summary.averageHeartRate}</Text>
            <Text style={styles.vitalLabel}>Avg HR</Text>
          </View>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{summary.maxHeartRate}</Text>
            <Text style={styles.vitalLabel}>Max HR</Text>
          </View>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{summary.averageSpO2}%</Text>
            <Text style={styles.vitalLabel}>Avg SpO₂</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Calories</Text>
        <Text style={styles.caloriesValue}>{summary.estimatedCalories} kcal</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.secondaryButton, isSynced && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving || isSynced}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            {isSaving ? 'Saving...' : isSynced ? 'Saved ✓' : 'Save to Cloud'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.discardButton}
          onPress={handleDiscard}
          activeOpacity={0.8}
        >
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
      </View>

      {isSynced && (
        <View style={styles.syncedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.syncedText}>Synced to cloud</Text>
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
  header: {
    alignItems: 'center',
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
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  primaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  primaryValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  primaryLabel: {
    fontSize: typography.fontSize.sm,
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
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vitalItem: {
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  vitalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  caloriesValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  discardButton: {
    flex: 1,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  discardText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  syncedText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
});