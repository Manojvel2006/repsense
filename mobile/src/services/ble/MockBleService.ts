import { 
  BleServiceInterface, 
  ConnectionState,
  ConnectedDevice
} from './BleServiceInterface';
import { BLEDevice, SensorData, FormStatus, ExerciseType, Device } from '@types';

type BleDevice = BLEDevice;
type ConnectedDeviceType = ConnectedDevice;

export class MockBleService implements BleServiceInterface {
  // Config (matches config.mock)
  private config = {
    enabled: true,
    baseHeartRate: 80,
    maxHeartRate: 160,
    baseSpO2: 98,
    repsPerMinute: 12,
    formDistribution: {
      CORRECT_CURL: 0.70,
      PARTIAL_CURL: 0.15,
      FAST_CURL: 0.10,
      INCORRECT_FORM: 0.05,
      NO_EXERCISE: 0,
    } as Record<FormStatus, number>,
  };

  // State
  private connectionState: ConnectionState = 'disconnected';
  private connectedDevice: ConnectedDeviceType | null = null;
  private sensorCallback: ((data: SensorData) => void) | null = null;
  private stateCallback: ((state: ConnectionState) => void) | null = null;
  private scanCallback: ((device: BleDevice) => void) | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private workoutStartTime: number = 0;
  private totalReps = 0;
  private lastRepTime = 0;
  private lastRepCount = 0;

  // --- Lifecycle ---
  async initialize(): Promise<void> {
    // No-op for mock
  }

  async destroy(): Promise<void> {
    this.stopScan();
    this.disconnect();
  }

  // --- Scanning ---
  async startScan(onDeviceFound: (device: BleDevice) => void): Promise<void> {
    this.scanCallback = onDeviceFound;
    this.setConnectionState('scanning');
    
    // Simulate finding device after 500ms
    setTimeout(() => {
      if (this.scanCallback) {
        const mockDevice: BleDevice = {
          id: 'mock-repsense-001',
          name: 'RepSense Band',
          rssi: -42,
          advertising: {
            serviceUUIDs: ['12345678-1234-1234-1234-123456789abc'],
          },
        };
        this.scanCallback(mockDevice);
      }
    }, 500);
  }

  async stopScan(): Promise<void> {
    this.scanCallback = null;
    if (this.connectionState === 'scanning') {
      this.setConnectionState('disconnected');
    }
  }

  // --- Connection ---
  async connect(deviceId: string): Promise<void> {
    this.setConnectionState('connecting');
    
    // Simulate connection delay
    await new Promise<void>(r => setTimeout(r, 1000));
    
    this.connectedDevice = {
      id: deviceId,
      name: 'RepSense Band',
      batteryLevel: 87,
      signalStrength: -42,
      isConnected: true,
      lastConnectedAt: new Date().toISOString(),
    };
    
    this.setConnectionState('connected');
    this.workoutStartTime = Date.now();
    this.totalReps = 0;
    this.lastRepCount = 0;
    this.startSensorStream();
  }

  async disconnect(): Promise<void> {
    this.setConnectionState('disconnecting');
    this.stopSensorStream();
    this.connectedDevice = null;
    this.setConnectionState('disconnected');
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getConnectedDevice(): ConnectedDeviceType | null {
    return this.connectedDevice;
  }

  // --- Data Streaming ---
  subscribeToSensorData(callback: (data: SensorData) => void): () => void {
    this.sensorCallback = callback;
    return () => { this.sensorCallback = null; };
  }

  subscribeToConnectionState(callback: (state: ConnectionState) => void): () => void {
    this.stateCallback = callback;
    return () => { this.stateCallback = null; };
  }

  // --- Mock Controls ---
  setMockMode(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) this.stopSensorStream();
    else if (this.connectionState === 'connected') this.startSensorStream();
  }

  isMockMode(): boolean {
    return this.config.enabled;
  }

  setRepRate(rpm: number): void {
    this.config.repsPerMinute = Math.max(1, Math.min(60, rpm));
  }

  setFormDistribution(dist: Partial<Record<FormStatus, number>>): void {
    this.config.formDistribution = { ...this.config.formDistribution, ...dist };
  }

  // --- Private Helpers ---
  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.stateCallback?.(state);
  }

  private startSensorStream(): void {
    this.stopSensorStream();
    this.workoutStartTime = Date.now();
    
    this.intervalId = setInterval(() => {
      if (!this.config.enabled || this.connectionState !== 'connected') return;
      this.generateSensorPacket();
    }, 50); // 20Hz
  }

  private stopSensorStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateSensorPacket(): void {
    if (!this.sensorCallback) return;

    const now = Date.now();
    const elapsed = (now - this.workoutStartTime) / 1000; // seconds
    
    // Rep generation (Poisson process)
    const repInterval = 60000 / this.config.repsPerMinute; // ms between reps avg
    const timeSinceLastRep = now - this.lastRepTime;
    const shouldRep = timeSinceLastRep > repInterval * 0.5 && Math.random() < (50 / repInterval);
    
    if (shouldRep) {
      this.totalReps++;
      this.lastRepTime = now;
    }

    // Heart rate: exponential rise toward max
    const hrProgress = Math.min(elapsed / 600, 1); // 10 min to max
    const targetHR = this.config.baseHeartRate + (this.config.maxHeartRate - this.config.baseHeartRate) * hrProgress;
    const heartRate = Math.round(targetHR + (Math.random() - 0.5) * 6);

    // SpO2: stable with occasional dip
    const spo2 = this.config.baseSpO2 - (Math.random() < 0.02 ? Math.random() * 3 : 0);

    // Form selection (weighted random)
    const form = this.weightedRandomForm();

    // IMU: simulate bicep curl motion (simplified)
    const phase = (elapsed * this.config.repsPerMinute / 60) % (2 * Math.PI);
    const ax = Math.sin(phase) * 0.5;
    const ay = Math.cos(phase) * 0.3;
    const az = 9.81 + Math.sin(phase * 2) * 0.2;
    const gx = Math.sin(phase) * 10;
    const gy = Math.cos(phase) * 5;
    const gz = Math.sin(phase * 1.5) * 3;

    const packet: SensorData = {
      timestamp: now,
      ax, ay, az,
      gx, gy, gz,
      heartRate: Math.max(40, Math.min(200, heartRate)),
      spo2: Math.max(85, Math.min(100, Math.round(spo2))),
      reps: this.totalReps,
      form,
      exercise: 'BICEP_CURL' as ExerciseType,
    };

    this.sensorCallback(packet);
    
    // Detect new rep for store
    if (this.totalReps > this.lastRepCount) {
      this.lastRepCount = this.totalReps;
    }
  }

  private weightedRandomForm(): FormStatus {
    const dist = this.config.formDistribution;
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [form, weight] of Object.entries(dist)) {
      cumulative += weight;
      if (rand < cumulative) return form as FormStatus;
    }
    return 'CORRECT_CURL';
  }
}