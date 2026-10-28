import { BleServiceInterface, ConnectionState } from './BleServiceInterface';
import { MockBleService } from './MockBleService';

class BleManager {
  private static instance: BleManager;
  private service: BleServiceInterface;
  private mode: 'mock' | 'real' = 'mock';

  private constructor() {
    this.service = new MockBleService();
  }

  static getInstance(): BleManager {
    if (!BleManager.instance) {
      BleManager.instance = new BleManager();
    }
    return BleManager.instance;
  }

  getService(): BleServiceInterface {
    return this.service;
  }

  // For future real BLE switch
  setMode(mode: 'mock' | 'real'): void {
    if (mode === this.mode) return;
    this.mode = mode;
    // When real BLE is added:
    // this.service.destroy();
    // this.service = mode === 'mock' ? new MockBleService() : new RealBleService();
    // this.service.initialize();
  }
}

export const bleManager = BleManager.getInstance();
export const getBleService = () => bleManager.getService();