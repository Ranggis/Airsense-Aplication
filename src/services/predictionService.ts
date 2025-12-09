/**
 * Prediction Service for ML Mode
 * 
 * This service handles air quality predictions using a Decision Tree model
 * deployed on Hugging Face Spaces.
 * 
 * IMPORTANT: This is ONLY for ML mode (OpenWeatherMap, OpenAQ data sources)
 * IoT mode uses threshold-based classification in iotClassificationService.ts
 * 
 * ML Model expects 7 features in order:
 * [PM10, PM2.5, SO2, CO, O3, NO2, MAX]
 */

import { 
  PollutantData, 
  PredictionResult, 
  AirQualityCategory 
} from '@/types/airQuality';
import { supabase } from '@/integrations/supabase/client';

// Fallback thresholds (Indonesian ISPU standards) - used if HF Space is unavailable
const THRESHOLDS = {
  pm_sepuluh: [50, 150, 350, 420],
  pm_duakomalima: [15, 55, 150, 250],
  sulfur_dioksida: [50, 180, 400, 800],
  karbon_monoksida: [4, 9, 15, 30],
  ozon: [50, 100, 200, 300],
  nitrogen_dioksida: [50, 100, 200, 400]
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
  return 4;
}

/**
 * Fallback prediction using rule-based ISPU approach
 */
function fallbackPrediction(pollutants: PollutantData): { category: AirQualityCategory; confidence: number } {
  const indices = [
    getCategoryIndex(pollutants.pm_sepuluh, THRESHOLDS.pm_sepuluh),
    getCategoryIndex(pollutants.pm_duakomalima, THRESHOLDS.pm_duakomalima),
    getCategoryIndex(pollutants.sulfur_dioksida, THRESHOLDS.sulfur_dioksida),
    getCategoryIndex(pollutants.karbon_monoksida, THRESHOLDS.karbon_monoksida),
    getCategoryIndex(pollutants.ozon, THRESHOLDS.ozon),
    getCategoryIndex(pollutants.nitrogen_dioksida, THRESHOLDS.nitrogen_dioksida),
  ];

  const worstIndex = Math.max(...indices);
  const category = CATEGORIES[worstIndex];
  const agreementCount = indices.filter(i => i === worstIndex).length;
  const confidence = 0.7 + (agreementCount / indices.length) * 0.25;

  return { category, confidence: Math.round(confidence * 100) / 100 };
}

/**
 * Calculate MAX value (daily critical ISPU value)
 * MAX is the highest ISPU sub-index among all pollutants
 */
function calculateMaxISPU(pollutants: PollutantData): number {
  const indices = [
    getCategoryIndex(pollutants.pm_sepuluh, THRESHOLDS.pm_sepuluh),
    getCategoryIndex(pollutants.pm_duakomalima, THRESHOLDS.pm_duakomalima),
    getCategoryIndex(pollutants.sulfur_dioksida, THRESHOLDS.sulfur_dioksida),
    getCategoryIndex(pollutants.karbon_monoksida, THRESHOLDS.karbon_monoksida),
    getCategoryIndex(pollutants.ozon, THRESHOLDS.ozon),
    getCategoryIndex(pollutants.nitrogen_dioksida, THRESHOLDS.nitrogen_dioksida),
  ];
  
  // Return the worst category index as MAX (0-4 scale)
  return Math.max(...indices);
}

/**
 * Predict air quality using Decision Tree model on Hugging Face Spaces
 * 
 * This function is ONLY called for ML mode (OpenWeatherMap/OpenAQ data)
 * IoT mode should use classifyIoTAirQuality() instead
 * 
 * @param pollutants - Pollutant data from external APIs
 * @returns PredictionResult with ML-based classification
 */
export async function predictAirQuality(
  pollutants: PollutantData
): Promise<PredictionResult> {
  try {
    // Calculate MAX value for the 7th feature
    const maxValue = pollutants.max ?? calculateMaxISPU(pollutants);
    
    // Prepare features in correct order: [PM10, PM2.5, SO2, CO, O3, NO2, MAX]
    const features = [
      pollutants.pm_sepuluh ?? 0,
      pollutants.pm_duakomalima ?? 0,
      pollutants.sulfur_dioksida ?? 0,
      pollutants.karbon_monoksida ?? 0,
      pollutants.ozon ?? 0,
      pollutants.nitrogen_dioksida ?? 0,
      maxValue
    ];

    console.log('[Prediction Service] ML features:', features);

    // Call the edge function that connects to Hugging Face Space
    const { data, error } = await supabase.functions.invoke('predict-air-quality', {
      body: { features }
    });

    if (error) {
      console.warn('[Prediction Service] HF Space error, using fallback:', error);
      const fallback = fallbackPrediction(pollutants);
      return {
        category: fallback.category,
        confidence: fallback.confidence,
        timestamp: new Date(),
        inputData: pollutants,
        method: 'ml' // Still mark as ml even with fallback
      };
    }

    // Check if we should use fallback
    if (data.useFallback || data.error) {
      console.warn('[Prediction Service] Using fallback prediction:', data.error);
      const fallback = fallbackPrediction(pollutants);
      return {
        category: fallback.category,
        confidence: fallback.confidence,
        timestamp: new Date(),
        inputData: pollutants,
        method: 'ml'
      };
    }

    // Map the category from HF Space to our standard categories
    const categoryMap: Record<string, AirQualityCategory> = {
      'BAIK': 'BAIK',
      'SEDANG': 'SEDANG',
      'TIDAK SEHAT': 'TIDAK SEHAT',
      'SANGAT TIDAK SEHAT': 'SANGAT TIDAK SEHAT',
      'BERBAHAYA': 'BERBAHAYA',
      // Handle variations
      'TIDAK_SEHAT': 'TIDAK SEHAT',
      'SANGAT_TIDAK_SEHAT': 'SANGAT TIDAK SEHAT',
    };

    const category = categoryMap[data.category] || 'SEDANG';

    console.log('[Prediction Service] ML result:', { category, confidence: data.confidence });

    return {
      category,
      confidence: data.confidence || 0.95,
      timestamp: new Date(),
      inputData: pollutants,
      method: 'ml'
    };

  } catch (error) {
    console.error('[Prediction Service] Error:', error);
    // Fallback to rule-based prediction
    const fallback = fallbackPrediction(pollutants);
    return {
      category: fallback.category,
      confidence: fallback.confidence,
      timestamp: new Date(),
      inputData: pollutants,
      method: 'ml'
    };
  }
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
