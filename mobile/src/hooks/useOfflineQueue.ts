import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueueService, QueuedWorkout } from '@services/offline';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedWorkout[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setQueue(offlineQueueService.getQueue());

    const unsubscribe = offlineQueueService.subscribe(setQueue);
    
    const netInfoSub = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      
      if (online && !isProcessing) {
        processQueue();
      }
    });

    return () => {
      unsubscribe();
      netInfoSub();
    };
  }, []);

  const processQueue = async () => {
    setIsProcessing(true);
    await offlineQueueService.processQueue();
    setIsProcessing(false);
    setQueue(offlineQueueService.getQueue());
  };

  const retryItem = async (id: string) => {
    await offlineQueueService.retryItem(id);
    setQueue(offlineQueueService.getQueue());
  };

  const removeItem = async (id: string) => {
    await offlineQueueService.removeItem(id);
    setQueue(offlineQueueService.getQueue());
  };

  const clearQueue = async () => {
    await offlineQueueService.clearQueue();
    setQueue([]);
  };

  return {
    queue,
    isOnline,
    isProcessing,
    pendingCount: queue.length,
    processQueue,
    retryItem,
    removeItem,
    clearQueue,
  };
};