export interface OfflineQueuedReport {
  id: string;
  timestamp: string;
  data: any;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

const OFFLINE_STORAGE_KEY = 'qawaq_offline_queue_v1';
const SIMULATED_OFFLINE_KEY = 'qawaq_simulated_offline';

type OfflineListener = (isOnline: boolean, queueCount: number) => void;

class OfflineServiceManager {
  private listeners: Set<OfflineListener> = new Set();
  private isSimulatedOffline: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isSimulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
      } catch {
        this.isSimulatedOffline = false;
      }

      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    if (this.isSimulatedOffline) return false;
    return navigator.onLine;
  }

  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    try {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, offline ? 'true' : 'false');
    } catch {}
    this.handleNetworkChange();
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public getQueue(): OfflineQueuedReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading offline queue:', e);
      return [];
    }
  }

  public saveReportOffline(reportData: any): OfflineQueuedReport {
    const queue = this.getQueue();
    const queuedItem: OfflineQueuedReport = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      data: reportData,
      retryCount: 0,
      status: 'pending',
    };

    queue.push(queuedItem);
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Error saving to offline queue:', e);
    }

    this.notifyListeners();
    return queuedItem;
  }

  public removeQueuedReport(id: string) {
    const queue = this.getQueue().filter((item) => item.id !== id);
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
    } catch {}
    this.notifyListeners();
  }

  public clearQueue() {
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
    } catch {}
    this.notifyListeners();
  }

  public async syncQueue(
    syncCallback: (reportData: any) => Promise<boolean> | boolean
  ): Promise<{ syncedCount: number; failedCount: number }> {
    if (!this.isOnline()) {
      return { syncedCount: 0, failedCount: 0 };
    }

    const queue = this.getQueue();
    if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: OfflineQueuedReport[] = [];

    for (const item of queue) {
      try {
        const success = await syncCallback(item.data);
        if (success) {
          syncedCount++;
        } else {
          item.retryCount = (item.retryCount || 0) + 1;
          item.status = 'failed';
          remainingQueue.push(item);
          failedCount++;
        }
      } catch (err) {
        console.error('Failed to sync offline item:', err);
        item.retryCount = (item.retryCount || 0) + 1;
        item.status = 'failed';
        remainingQueue.push(item);
        failedCount++;
      }
    }

    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(remainingQueue));
    } catch {}

    this.notifyListeners();
    return { syncedCount, failedCount };
  }

  public subscribe(listener: OfflineListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.isOnline(), this.getQueue().length);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleNetworkChange() {
    this.notifyListeners();
  }

  private notifyListeners() {
    const online = this.isOnline();
    const count = this.getQueue().length;
    this.listeners.forEach((listener) => {
      try {
        listener(online, count);
      } catch (err) {
        console.error('Error in offline listener:', err);
      }
    });
  }
}

export const OfflineService = new OfflineServiceManager();
