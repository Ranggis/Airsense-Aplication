/**
 * Firebase Realtime Database Service for IoT Mode
 * 
 * This service handles fetching sensor data from Firebase Realtime Database.
 * IoT mode uses MQ-135 (gas_index), DHT22 (temp/humidity), BMP280 (pressure)
 * 
 * Expected Firebase data structure (pushed to /air_quality):
 * {
 *   "mq135_raw": 503,
 *   "gas_index": 61.41,
 *   "temperature": 29.3,
 *   "humidity": 75.6,
 *   "pressure": 989.83,
 *   "category": "BAIK",
 *   "local_time_s": 16,
 *   "timestamp": 1765386610449
 * }
 */

import { IoTConfig, SensorReading, IoTSensorData } from '@/types/airQuality';

interface FirebaseEntry {
  gas_index: number;
  mq135_raw: number;
  temperature: number;
  humidity: number;
  pressure: number;
  category: string;
  local_time_s?: number;
  timestamp?: number;
}

/**
 * Fetch the latest sensor data from Firebase Realtime Database
 * 
 * @param config - Firebase configuration with URL and data path
 * @returns SensorReading with IoT sensor data
 */
export async function fetchFirebaseData(config: IoTConfig): Promise<SensorReading> {
  // Validate configuration
  if (!config.firebaseUrl) {
    throw new Error('Firebase URL harus diisi');
  }

  try {
    // Fetch from /air_quality path (history data pushed by ESP32)
    const url = `${config.firebaseUrl}${config.dataPath}.json`;
    console.log('[Firebase Service] Fetching from:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('Data tidak ditemukan di Firebase');
    }

    // Data from Firebase is an object with push keys, get the latest entry
    let latestEntry: FirebaseEntry | null = null;
    let latestTimestamp = 0;

    // Handle both single object and pushed history object
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Check if it's a direct sensor reading or pushed history
      if ('gas_index' in data) {
        // Direct sensor reading format
        latestEntry = data as FirebaseEntry;
      } else {
        // Pushed history format - find latest by timestamp
        for (const key of Object.keys(data)) {
          const entry = data[key] as FirebaseEntry;
          const entryTimestamp = entry.timestamp || 0;
          if (entryTimestamp > latestTimestamp) {
            latestTimestamp = entryTimestamp;
            latestEntry = entry;
          }
        }
      }
    }

    if (!latestEntry) {
      throw new Error('Format data Firebase tidak valid');
    }

    console.log('[Firebase Service] Latest entry:', latestEntry);

    // Parse IoT sensor data
    const iotData: IoTSensorData = {
      gas_index: parseFloat(String(latestEntry.gas_index)) || 0,
      mq135_raw: latestEntry.mq135_raw !== undefined ? parseFloat(String(latestEntry.mq135_raw)) : null,
      suhu: latestEntry.temperature !== undefined ? parseFloat(String(latestEntry.temperature)) : null,
      kelembapan: latestEntry.humidity !== undefined ? parseFloat(String(latestEntry.humidity)) : null,
      tekanan: latestEntry.pressure !== undefined ? parseFloat(String(latestEntry.pressure)) : null,
      category: latestEntry.category,
      timestamp: latestEntry.timestamp,
      local_time_s: latestEntry.local_time_s,
    };

    console.log('[Firebase Service] IoT Data received:', iotData);

    return {
      pollutants: {
        pm_sepuluh: null,
        pm_duakomalima: null,
        sulfur_dioksida: null,
        karbon_monoksida: null,
        ozon: null,
        nitrogen_dioksida: null,
      },
      iotData,
      weather: {
        suhu: iotData.suhu,
        kelembapan: iotData.kelembapan,
        tekanan: iotData.tekanan,
        kondisi: null,
      },
      timestamp: latestEntry.timestamp ? new Date(latestEntry.timestamp) : new Date(),
      source: 'iot',
      location: 'IoT Sensor'
    };
  } catch (error) {
    console.error('[Firebase Service] Error:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates from Firebase using polling
 * Firebase REST API doesn't support true WebSocket streaming without SDK
 * So we poll every 5 seconds for near real-time updates
 */
export function subscribeToFirebaseData(
  config: IoTConfig,
  callback: (data: SensorReading) => void,
  onError?: (error: Error) => void
): () => void {
  console.log('[Firebase Service] Starting real-time subscription');
  
  let isActive = true;
  const POLL_INTERVAL = 5000; // Poll every 5 seconds for real-time feel

  const poll = async () => {
    if (!isActive) return;
    
    try {
      const data = await fetchFirebaseData(config);
      if (isActive) {
        callback(data);
      }
    } catch (error) {
      console.error('[Firebase Service] Subscription error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
    
    if (isActive) {
      setTimeout(poll, POLL_INTERVAL);
    }
  };

  // Start polling
  poll();

  return () => {
    console.log('[Firebase Service] Stopping real-time subscription');
    isActive = false;
  };
}
