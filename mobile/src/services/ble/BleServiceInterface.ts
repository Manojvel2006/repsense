import { SensorData, BLEDevice, FormStatus, ExerciseType, Device } from '@types';

export type BleDevice = BLEDevice;
export type ConnectedDevice = BleDevice | Device;

export type ConnectionState = 
  | 'disconnected' 
  | 'scanning' 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting';

export interface BleServiceInterface {
  // Lifecycle
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  
  // Scanning
  startScan(onDeviceFound: (device: BleDevice) => void): Promise<void>;
  stopScan(): Promise<void>;
  
  // Connection
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionState(): ConnectionState;
  getConnectedDevice(): ConnectedDevice | null;
  
  // Data streaming (single subscriber)
  subscribeToSensorData(callback: (data: SensorData) => void): () => void;
  subscribeToConnectionState(callback: (state: ConnectionState) => void): () => void;
  
  // Mock-specific controls
  setMockMode(enabled: boolean): void;
  isMockMode(): boolean;
  
  // Mock config (optional)
  setRepRate?(rpm: number): void;
  setFormDistribution?(dist: Partial<Record<FormStatus, number>>): void;
}