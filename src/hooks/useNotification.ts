/**
 * Air Quality Notification Hook
 * 
 * This hook manages notifications for air quality changes.
 * It prevents notification spam by:
 * 1. Only notifying when category changes
 * 2. Enforcing a minimum interval between same-category notifications
 */

import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  AirQualityCategory, 
  AirQualityNotification 
} from '@/types/airQuality';
import { compareCategoryChange } from '@/services/predictionService';

const NOTIFICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

interface NotificationRecord {
  category: AirQualityCategory;
  timestamp: number;
}

export function useAirQualityNotification() {
  const lastNotification = useRef<NotificationRecord | null>(null);

  const notify = useCallback((
    previousCategory: AirQualityCategory | null,
    newCategory: AirQualityCategory
  ): AirQualityNotification | null => {
    const now = Date.now();
    
    // Check if this is the initial reading (no previous category)
    if (!previousCategory) {
      lastNotification.current = { category: newCategory, timestamp: now };
      return null;
    }

    // Check if category has changed
    const change = compareCategoryChange(previousCategory, newCategory);
    if (change === 'same') {
      return null;
    }

    // Check spam prevention: same category notified recently
    if (
      lastNotification.current &&
      lastNotification.current.category === newCategory &&
      now - lastNotification.current.timestamp < NOTIFICATION_INTERVAL
    ) {
      console.log('[Notification] Skipping duplicate notification within interval');
      return null;
    }

    // Create notification
    const isImprovement = change === 'improved';
    const notification: AirQualityNotification = {
      id: `aq-${now}`,
      previousCategory,
      newCategory,
      isImprovement,
      timestamp: new Date(),
      message: isImprovement
        ? `Kualitas udara membaik menjadi ${newCategory}.`
        : `Kualitas udara menurun menjadi ${newCategory}. ${getWarningMessage(newCategory)}`
    };

    // Update last notification record
    lastNotification.current = { category: newCategory, timestamp: now };

    // Show toast notification
    if (isImprovement) {
      toast.success(notification.message, {
        duration: 5000,
        position: 'top-right',
      });
    } else {
      toast.warning(notification.message, {
        duration: 8000,
        position: 'top-right',
      });
    }

    return notification;
  }, []);

  const reset = useCallback(() => {
    lastNotification.current = null;
  }, []);

  return { notify, reset };
}

function getWarningMessage(category: AirQualityCategory): string {
  switch (category) {
    case 'SEDANG':
      return 'Kelompok sensitif sebaiknya membatasi aktivitas luar ruangan.';
    case 'TIDAK SEHAT':
      return 'Disarankan mengurangi aktivitas di luar ruangan.';
    case 'SANGAT TIDAK SEHAT':
      return 'Hindari aktivitas di luar ruangan.';
    case 'BERBAHAYA':
      return 'PERINGATAN: Tetap di dalam ruangan dan hindari paparan udara luar!';
    default:
      return '';
  }
}
