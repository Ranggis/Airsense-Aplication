/**
 * Firebase Realtime Database Service for IoT Mode
 * 
 * This service handles fetching sensor data from Firebase Realtime Database.
 * IoT mode uses MQ-135 (gas_index), DHT22 (temp/humidity), BMP280 (pressure)
 * 
 * Expected Firebase data structure:
 * {
 *   "sensor": {
 *     "gas_index": 150,      // MQ-135 sensor value
 *     "suhu": 28.5,          // DHT22 temperature
 *     "kelembapan": 65,      // DHT22 humidity
 *     "tekanan": 1013.25     // BMP280 pressure
 *   }
 * }
 */

import { IoTConfig, SensorReading, IoTSensorData } from '@/types/airQuality';

/**
 * Fetch sensor data from Firebase Realtime Database
 * 
 * @param config - Firebase configuration with URL and data path
 * @returns SensorReading with IoT sensor data (gas_index, temp, humidity, pressure)
 */
export async function fetchFirebaseData(config: IoTConfig): Promise<SensorReading> {
  // Validate configuration
  if (!config.firebaseUrl || !config.dataPath) {
    throw new Error('Firebase URL dan path data harus diisi');
  }

  try {
    // Build the Firebase REST API URL
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

    // Parse IoT sensor data
    const iotData: IoTSensorData = {
      gas_index: parseFloat(data.gas_index) || 0,
      suhu: data.suhu !== undefined ? parseFloat(data.suhu) : null,
      kelembapan: data.kelembapan !== undefined ? parseFloat(data.kelembapan) : null,
      tekanan: data.tekanan !== undefined ? parseFloat(data.tekanan) : null,
    };

    console.log('[Firebase Service] IoT Data received:', iotData);

    // For IoT mode, pollutants are not used (ML not called)
    // We still populate with nulls for interface compatibility
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
      timestamp: new Date(),
      source: 'iot',
      location: 'IoT Sensor'
    };
  } catch (error) {
    console.error('[Firebase Service] Error:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates from Firebase
 */
export function subscribeToFirebaseData(
  config: IoTConfig,
  callback: (data: SensorReading) => void
): () => void {
  console.log('[Firebase Service] Starting subscription to:', config.dataPath);
  
  const intervalId = setInterval(async () => {
    try {
      const data = await fetchFirebaseData(config);
      callback(data);
    } catch (error) {
      console.error('[Firebase Service] Subscription error:', error);
    }
  }, 30000); // Update every 30 seconds

  return () => {
    console.log('[Firebase Service] Unsubscribing from:', config.dataPath);
    clearInterval(intervalId);
  };
}
