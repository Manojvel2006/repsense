import { create } from 'zustand';
import { BLEDevice, Device } from '@types';

export type ConnectionState = 
  | 'disconnected' 
  | 'scanning' 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting';

interface DeviceStore {
  devices: BLEDevice[];
  connectedDevice: Device | null;
  isScanning: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  error: string | null;

  setDevices: (devices: BLEDevice[]) => void;
  addDevice: (device: BLEDevice) => void;
  removeDevice: (id: string) => void;
  clearDevices: () => void;
  setScanning: (scanning: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectedDevice: (device: Device | null) => void;
  updateConnectedDevice: (updates: Partial<Device>) => void;
  setConnectionState: (state: ConnectionState) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: [],
  connectedDevice: null,
  isScanning: false,
  isConnecting: false,
  connectionState: 'disconnected',
  error: null,

  setDevices: (devices) => set({ devices }),

  addDevice: (device) => set((state) => {
    const exists = state.devices.find(d => d.id === device.id);
    if (exists) {
      return { devices: state.devices.map(d => d.id === device.id ? device : d) };
    }
    return { devices: [...state.devices, device] };
  }),

  removeDevice: (id) => set((state) => ({
    devices: state.devices.filter(d => d.id !== id),
  })),

  clearDevices: () => set({ devices: [] }),

  setScanning: (isScanning) => set({ isScanning }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setConnectedDevice: (connectedDevice) => set({ connectedDevice }),

  updateConnectedDevice: (updates) => set((state) => ({
    connectedDevice: state.connectedDevice ? { ...state.connectedDevice, ...updates } : null,
  })),

  setConnectionState: (connectionState) => set({ connectionState }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));