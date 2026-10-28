import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { useDeviceStore } from '@store/deviceStore';
import { colors, spacing, borderRadius, typography, shadows } from '@theme';
import { Ionicons } from '@expo/vector-icons';

type ConnectDeviceNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConnectDevice'>;

export const ConnectDeviceScreen = () => {
  const navigation = useNavigation<ConnectDeviceNavigationProp>();
  const { devices, connectedDevice, isScanning, isConnecting, error, clearError,
    setScanning, setConnecting, setConnectedDevice, addDevice, clearDevices } = useDeviceStore();
  const [showConnected, setShowConnected] = useState(false);

  useEffect(() => {
    if (connectedDevice) {
      setShowConnected(true);
    }
  }, [connectedDevice]);

  const handleScan = async () => {
    setScanning(true);
    clearDevices();
    clearError();
    
    try {
      // TODO: Implement actual BLE scan
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // Mock device for demo
      addDevice({
        id: 'mock-device-1',
        name: 'RepSense Band',
        rssi: -45,
        advertising: { serviceUUIDs: ['12345678-1234-1234-1234-123456789abc'] },
      });
    } catch {
      Alert.alert('Error', 'Failed to scan for devices');
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    setConnecting(true);
    try {
      // TODO: Implement actual BLE connect
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
      
      setConnectedDevice({
        id: deviceId,
        name: 'RepSense Band',
        batteryLevel: 85,
        signalStrength: -45,
        isConnected: true,
        lastConnectedAt: new Date().toISOString(),
      });
      
      Alert.alert('Connected', 'RepSense Band connected successfully!');
      setTimeout(() => navigation.navigate('Main'), 1000);
    } catch {
      Alert.alert('Error', 'Failed to connect to device');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
    setShowConnected(false);
  };

  const handleSkip = () => {
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {showConnected && connectedDevice ? (
          <View style={styles.connectedCard}>
            <View style={styles.deviceIcon}>
              <Ionicons name="bluetooth" size={48} color={colors.success} />
            </View>
            <Text style={styles.connectedTitle}>Device Connected</Text>
            <Text style={styles.connectedSubtitle}>
              {connectedDevice.name} is ready to use
            </Text>
            
            <View style={styles.deviceInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Battery</Text>
                <Text style={styles.infoValue}>{connectedDevice.batteryLevel}%</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Signal</Text>
                <Text style={styles.infoValue}>{connectedDevice.signalStrength} dBm</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Main')}>
              <Text style={styles.continueText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.deviceIcon}>
              <Ionicons name="bandage" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Connect RepSense Band</Text>
            <Text style={styles.subtitle}>
              Turn on your band and bring it close to your phone
            </Text>

            {devices.length === 0 && !isScanning && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No devices found yet</Text>
                <Text style={styles.emptySubtext}>Tap "Scan" to search for your RepSense Band</Text>
              </View>
            )}

            {devices.length > 0 && (
              <View style={styles.deviceList}>
                {devices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                    onPress={() => handleConnect(device.id)}
                    disabled={isConnecting}
                  >
                    <View style={styles.deviceItemLeft}>
                      <Ionicons name="bluetooth" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.deviceItemCenter}>
                      <Text style={styles.deviceName}>
                        {device.name || 'RepSense Band'}
                      </Text>
                      <Text style={styles.deviceSignal}>
                        Signal: {device.rssi} dBm
                      </Text>
                    </View>
                    <View style={styles.deviceItemRight}>
                      {isConnecting ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={[styles.scanButton, isScanning && styles.buttonDisabled]}
              onPress={handleScan}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Scanning...' : 'Scan for Devices'}
              </Text>
            </TouchableOpacity>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  connectedCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  deviceIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  connectedTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  connectedSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  deviceInfo: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  disconnectButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  disconnectText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.sm,
  },
  continueText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  deviceList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  deviceItemLeft: {
    marginRight: spacing.md,
  },
  deviceItemCenter: {
    flex: 1,
  },
  deviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  deviceSignal: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  deviceItemRight: {},
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
  },
});