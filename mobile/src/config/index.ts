import Constants from 'expo-constants';

/**
 * In dev, the packager host is the machine Metro runs on. A physical phone
 * running Expo Go cannot reach `10.0.2.2` (that's an Android-emulator-only
 * alias for the host's localhost), so derive the dev machine's LAN IP from
 * the Metro host URI — zero config, and it keeps working if the IP changes.
 * Override with EXPO_PUBLIC_API_URL in a `.env` file when needed
 * (restart Metro after changing `.env`).
 */
function resolveApiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) {
    return override;
  }
  if (!__DEV__) {
    return 'https://api.repsense.app/api/v1';
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return `http://${host}:3000/api/v1`;
  }
  // Android emulator fallback: 10.0.2.2 maps to the host's localhost.
  return 'http://10.0.2.2:3000/api/v1';
}

export const config = {
  api: {
    baseUrl: resolveApiBaseUrl(),
    timeout: 15000,
  },
  ble: {
    serviceUUID: '12345678-1234-1234-1234-123456789abc',
    characteristicUUID: '12345678-1234-1234-1234-123456789abd',
    deviceName: 'RepSense',
    scanTimeout: 10000,
    connectTimeout: 15000,
  },
  workout: {
    countdownDuration: 3,
    autoPauseThreshold: 30000,
    formFeedbackCooldown: 5000,
    milestoneReps: [10, 20, 30, 50, 100],
  },
  storage: {
    tokenKey: '@repsense_token',
    userKey: '@repsense_user',
    workoutQueueKey: '@repsense_workout_queue',
    mockModeKey: '@repsense_mock_mode',
  },
  mock: {
    enabled: __DEV__,
    baseHeartRate: 80,
    maxHeartRate: 160,
    baseSpO2: 98,
    repsPerMinute: 12,
    formDistribution: {
      CORRECT_CURL: 0.7,
      PARTIAL_CURL: 0.15,
      FAST_CURL: 0.1,
      INCORRECT_FORM: 0.05,
    },
  },
};

export type Config = typeof config;