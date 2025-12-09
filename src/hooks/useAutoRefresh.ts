import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval: number; // in milliseconds
  enabled: boolean;
  onRefresh: () => void | Promise<void>;
}

export function useAutoRefresh({ interval, enabled, onRefresh }: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    console.log('[AutoRefresh] Triggering refresh...');
    lastRefreshRef.current = new Date();
    
    try {
      await onRefresh();
      console.log('[AutoRefresh] Refresh completed');
    } catch (error) {
      console.error('[AutoRefresh] Refresh failed:', error);
    }
  }, [enabled, onRefresh]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`[AutoRefresh] Starting auto-refresh with interval: ${interval}ms`);
    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        console.log('[AutoRefresh] Stopping auto-refresh');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refresh]);

  return {
    lastRefresh: lastRefreshRef.current,
    triggerRefresh: refresh,
  };
}
