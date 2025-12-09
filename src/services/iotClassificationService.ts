/**
 * IoT Classification Service
 * 
 * Threshold-based classification for IoT realtime mode.
 * Uses gas_index from MQ-135 sensor ONLY - NO machine learning API calls.
 * 
 * Classification rules:
 * - gas_index < 100 → BAIK (GOOD)
 * - 100 ≤ gas_index < 200 → SEDANG (MODERATE)  
 * - gas_index ≥ 200 → TIDAK SEHAT (UNHEALTHY)
 */

import { AirQualityCategory, IoTSensorData, PredictionResult } from '@/types/airQuality';

/**
 * Classify air quality based on MQ-135 gas_index threshold
 * This function runs LOCALLY - no API calls to Hugging Face
 * 
 * @param iotData - IoT sensor data containing gas_index
 * @returns PredictionResult with category based on threshold rules
 */
export function classifyIoTAirQuality(iotData: IoTSensorData): PredictionResult {
  const { gas_index } = iotData;
  
  let category: AirQualityCategory;
  let confidence: number;

  if (gas_index < 100) {
    category = 'BAIK';
    confidence = 0.95;
  } else if (gas_index < 200) {
    category = 'SEDANG';
    confidence = 0.90;
  } else {
    category = 'TIDAK SEHAT';
    confidence = 0.85;
  }

  console.log(`[IoT Classification] gas_index: ${gas_index} → category: ${category}`);

  return {
    category,
    confidence,
    timestamp: new Date(),
    inputData: {
      pm_sepuluh: null,
      pm_duakomalima: null,
      sulfur_dioksida: null,
      karbon_monoksida: null,
      ozon: null,
      nitrogen_dioksida: null,
    },
    method: 'threshold'
  };
}

/**
 * Get description for IoT air quality category
 */
export function getIoTCategoryDescription(category: AirQualityCategory): string {
  const descriptions: Record<AirQualityCategory, string> = {
    'BAIK': 'Kualitas udara baik. Aman untuk aktivitas luar ruangan.',
    'SEDANG': 'Kualitas udara sedang. Kelompok sensitif sebaiknya membatasi aktivitas.',
    'TIDAK SEHAT': 'Kualitas udara tidak sehat. Kurangi aktivitas di luar ruangan.',
    'SANGAT TIDAK SEHAT': 'Kualitas udara sangat tidak sehat. Hindari aktivitas luar.',
    'BERBAHAYA': 'Kondisi berbahaya. Tetap di dalam ruangan.'
  };
  return descriptions[category];
}

/**
 * Get threshold info for display
 */
export function getIoTThresholdInfo(): { min: number; max: number; category: AirQualityCategory }[] {
  return [
    { min: 0, max: 99, category: 'BAIK' },
    { min: 100, max: 199, category: 'SEDANG' },
    { min: 200, max: Infinity, category: 'TIDAK SEHAT' }
  ];
}
