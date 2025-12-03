/**
 * Prediction Service
 * 
 * This service handles air quality predictions using a Decision Tree model.
 * Currently implemented as a dummy/mock function.
 * 
 * TODO: Replace with actual model integration
 * - Option 1: Load .joblib model via Python backend endpoint
 * - Option 2: Use ONNX.js for client-side inference
 * - Option 3: Call external ML API endpoint
 */

import { 
  PollutantData, 
  PredictionResult, 
  AirQualityCategory 
} from '@/types/airQuality';

// Air quality category thresholds based on Indonesian ISPU standards (simplified)
const THRESHOLDS = {
  pm_sepuluh: [50, 150, 350, 420],      // PM10 thresholds
  pm_duakomalima: [15, 55, 150, 250],   // PM2.5 thresholds
  sulfur_dioksida: [50, 180, 400, 800], // SO₂ thresholds
  karbon_monoksida: [4, 9, 15, 30],     // CO thresholds
  ozon: [50, 100, 200, 300],            // O₃ thresholds
  nitrogen_dioksida: [50, 100, 200, 400] // NO₂ thresholds
};

const CATEGORIES: AirQualityCategory[] = [
  'BAIK',
  'SEDANG', 
  'TIDAK SEHAT',
  'SANGAT TIDAK SEHAT',
  'BERBAHAYA'
];

/**
 * Calculate category index based on pollutant value and thresholds
 */
function getCategoryIndex(value: number | null, thresholds: number[]): number {
  if (value === null) return 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return 4; // BERBAHAYA
}

/**
 * Dummy Decision Tree prediction function
 * 
 * This function simulates the Decision Tree model prediction.
 * It uses simple threshold-based rules to determine air quality category.
 * 
 * @param pollutants - The pollutant data from sensors
 * @returns PredictionResult with category and confidence
 * 
 * TODO: Replace this function body with actual model inference:
 * 
 * Example for Python backend integration:
 * ```typescript
 * async function predictWithModel(pollutants: PollutantData): Promise<PredictionResult> {
 *   const response = await fetch('/api/predict', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(pollutants)
 *   });
 *   return response.json();
 * }
 * ```
 */
export async function predictAirQuality(
  pollutants: PollutantData
): Promise<PredictionResult> {
  // Simulate processing delay (remove in production)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Calculate category index for each pollutant
  const indices = [
    getCategoryIndex(pollutants.pm_sepuluh, THRESHOLDS.pm_sepuluh),
    getCategoryIndex(pollutants.pm_duakomalima, THRESHOLDS.pm_duakomalima),
    getCategoryIndex(pollutants.sulfur_dioksida, THRESHOLDS.sulfur_dioksida),
    getCategoryIndex(pollutants.karbon_monoksida, THRESHOLDS.karbon_monoksida),
    getCategoryIndex(pollutants.ozon, THRESHOLDS.ozon),
    getCategoryIndex(pollutants.nitrogen_dioksida, THRESHOLDS.nitrogen_dioksida),
  ];

  // Use the worst category (highest index) - this simulates Decision Tree logic
  const worstIndex = Math.max(...indices);
  const category = CATEGORIES[worstIndex];

  // Calculate mock confidence based on how many pollutants agree
  const agreementCount = indices.filter(i => i === worstIndex).length;
  const confidence = 0.7 + (agreementCount / indices.length) * 0.25;

  return {
    category,
    confidence: Math.round(confidence * 100) / 100,
    timestamp: new Date(),
    inputData: pollutants
  };
}

/**
 * Get color class for air quality category
 */
export function getCategoryColorClass(category: AirQualityCategory): string {
  const colorMap: Record<AirQualityCategory, string> = {
    'BAIK': 'aq-good',
    'SEDANG': 'aq-moderate',
    'TIDAK SEHAT': 'aq-unhealthy-sensitive',
    'SANGAT TIDAK SEHAT': 'aq-unhealthy',
    'BERBAHAYA': 'aq-hazardous'
  };
  return colorMap[category];
}

/**
 * Get recommendation message based on air quality category
 */
export function getCategoryRecommendation(category: AirQualityCategory): string {
  const recommendations: Record<AirQualityCategory, string> = {
    'BAIK': 'Kualitas udara sangat baik. Cocok untuk aktivitas luar ruangan.',
    'SEDANG': 'Kualitas udara dapat diterima. Kelompok sensitif sebaiknya membatasi aktivitas luar.',
    'TIDAK SEHAT': 'Kualitas udara mulai berdampak pada kesehatan. Kurangi aktivitas di luar ruangan.',
    'SANGAT TIDAK SEHAT': 'Kualitas udara berbahaya bagi kesehatan. Hindari aktivitas di luar ruangan.',
    'BERBAHAYA': 'Kondisi darurat kesehatan. Seluruh populasi terdampak serius. Tetap di dalam ruangan.'
  };
  return recommendations[category];
}

/**
 * Check if category has improved or worsened
 */
export function compareCategoryChange(
  previous: AirQualityCategory, 
  current: AirQualityCategory
): 'improved' | 'worsened' | 'same' {
  const prevIndex = CATEGORIES.indexOf(previous);
  const currIndex = CATEGORIES.indexOf(current);
  
  if (currIndex < prevIndex) return 'improved';
  if (currIndex > prevIndex) return 'worsened';
  return 'same';
}
