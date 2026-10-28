import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineQueue } from '@hooks/useOfflineQueue';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';

export const OfflineQueueIndicator = () => {
  const { pendingCount, isOnline, isProcessing } = useOfflineQueue();

  if (pendingCount === 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOnline ? styles.online : styles.offline,
        isProcessing && styles.processing,
      ]}
      onPress={() => Alert.alert(
        'Pending Sync',
        `${pendingCount} workout${pendingCount > 1 ? 's' : ''} waiting to sync.${isOnline ? ' Will sync automatically.' : ' Will sync when online.'}`,
        [{ text: 'OK' }]
      )}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {isProcessing ? (
          <ActivityIndicator size={16} color={colors.white} />
        ) : (
          <Ionicons 
            name={isOnline ? 'cloud-upload' : 'cloud-offline'} 
            size={20} 
            color={colors.white} 
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>
          {isProcessing ? 'Syncing...' : isOnline ? 'Pending Sync' : 'Offline'}
        </Text>
        <Text style={styles.count}>{pendingCount} workout{pendingCount > 1 ? 's' : ''}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const OfflineQueueScreen = () => {
  const { queue, isOnline, isProcessing, processQueue, retryItem, removeItem, pendingCount } = useOfflineQueue();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.queueItem} activeOpacity={0.8}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.exerciseName}>{item.payload.exerciseType.replace('_', ' ')}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.itemStatus}>
          {item.retryCount > 0 && (
            <View style={[styles.retryBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.retryText}>Retry {item.retryCount}/5</Text>
            </View>
          )}
          {item.lastError && (
            <View style={styles.errorBadge}>
              <Text style={styles.errorText} numberOfLines={1}>{item.lastError}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.itemStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.payload.totalReps}</Text>
          <Text style={styles.statLabel}>Reps</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.payload.formAccuracy.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.payload.estimatedCalories} kcal</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.retryButton]}
          onPress={() => retryItem(item.id)}
          disabled={isProcessing}
        >
          <Ionicons name="refresh" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => Alert.alert(
            'Remove from queue?',
            'This workout will be permanently deleted.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) }
            ]
          )}
          disabled={isProcessing}
        >
          <Ionicons name="trash" size={18} color={colors.error} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (queue.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        <Text style={styles.emptyTitle}>All Synced!</Text>
        <Text style={styles.emptySubtitle}>
          {isOnline ? 'No pending workouts to sync.' : 'Workouts will sync when you\'re back online.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Offline Queue</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        {pendingCount > 0 && !isProcessing && (
          <TouchableOpacity style={styles.syncButton} onPress={processQueue} activeOpacity={0.8}>
            <Ionicons name="cloud-upload" size={18} color={colors.white} />
            <Text style={styles.syncButtonText}>Sync All ({pendingCount})</Text>
          </TouchableOpacity>
        )}
        {isProcessing && (
          <View style={styles.syncingIndicator}>
            <ActivityIndicator size={18} color={colors.primary} />
            <Text style={styles.syncingText}>Syncing...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>All Synced!</Text>
            <Text style={styles.emptySubtitle}>
              {isOnline ? 'No pending workouts to sync.' : 'Workouts will sync when you\'re back online.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: colors.success,
  },
  statusOffline: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  syncButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  syncingText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  queueItem: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  itemStatus: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  retryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  retryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  errorBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  online: {
    backgroundColor: colors.primary,
  },
  offline: {
    backgroundColor: colors.warning,
  },
  processing: {
    opacity: 0.8,
  },
  iconContainer: {
    padding: spacing.xs,
  },
  textContainer: {
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  count: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
});