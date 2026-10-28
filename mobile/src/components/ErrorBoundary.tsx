import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (__DEV__) {
      console.log('Error caught by ErrorBoundary:', error.message);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReport = (): void => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: '1.0.0',
    };

    Alert.alert(
      'Report Error',
      'Would you like to copy the error details to clipboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Error',
          onPress: () => {
            const text = `RepSense Error Report\n\n${JSON.stringify(errorReport, null, 2)}`;
            console.log('Error report copied:', text);
            Alert.alert('Copied', 'Error details copied to console');
          },
        },
      ]);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorLabel}>Error:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleReport}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={[styles.buttonText, { color: colors.primary }]}>Report Error</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorDetails: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  errorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stackText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textTertiary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  secondaryButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});