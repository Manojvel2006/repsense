import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@services/api';
import { WorkoutSummary } from '@types';

const OFFLINE_QUEUE_KEY = '@repsense_offline_queue';
const MAX_QUEUE_SIZE = 50;

export interface QueuedWorkout {
  id: string;
  payload: WorkoutSummary & { startTime: string; endTime: string };
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export class OfflineQueueService {
  private static instance: OfflineQueueService;
  private queue: QueuedWorkout[] = [];
  private isProcessing = false;
  private listeners: Array<(queue: QueuedWorkout[]) => void> = [];

  private constructor() {}

  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  async addToQueue(payload: WorkoutSummary & { startTime: string; endTime: string }): Promise<void> {
    const queuedWorkout: QueuedWorkout = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.unshift(queuedWorkout);
    
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(0, MAX_QUEUE_SIZE);
    }

    await this.persist();
    this.notifyListeners();
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      
      if (item.retryCount >= 5) {
        continue;
      }

      try {
        await apiService.createWorkout(item.payload as unknown as Record<string, unknown>);
        this.queue.splice(i, 1);
        i--;
        await this.persist();
        this.notifyListeners();
      } catch (error: any) {
        item.retryCount++;
        item.lastError = error.message;
        await this.persist();
        this.notifyListeners();
        
        if (error.message?.includes('Network') || error.message?.includes('timeout')) {
          break;
        }
      }
    }

    this.isProcessing = false;
  }

  async retryItem(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id);
    if (!item) return;

    item.retryCount = 0;
    item.lastError = undefined;
    await this.persist();
    this.notifyListeners();
    await this.processQueue();
  }

  async removeItem(id: string): Promise<void> {
    this.queue = this.queue.filter(q => q.id !== id);
    await this.persist();
    this.notifyListeners();
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.persist();
    this.notifyListeners();
  }

  getQueue(): QueuedWorkout[] {
    return [...this.queue];
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  subscribe(listener: (queue: QueuedWorkout[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }
}

export const offlineQueueService = OfflineQueueService.getInstance();