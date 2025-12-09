import { supabase } from '@/integrations/supabase/client';
import { DataSource, PredictionResult, SensorReading } from '@/types/airQuality';

interface AirQualityReadingInsert {
  data_source: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  pm10: number | null;
  pm25: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  no2: number | null;
  category: string;
  confidence: number | null;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
}

/**
 * Save air quality reading to database for historical tracking
 */
export async function saveAirQualityReading(
  sensorData: SensorReading,
  prediction: PredictionResult,
  dataSource: DataSource
): Promise<boolean> {
  console.log('[History Service] Saving reading:', { dataSource, category: prediction.category });

  const reading: AirQualityReadingInsert = {
    data_source: dataSource,
    location: sensorData.location || null,
    latitude: null, // Coordinates not available in current SensorReading type
    longitude: null,
    pm10: sensorData.pollutants.pm_sepuluh || null,
    pm25: sensorData.pollutants.pm_duakomalima || null,
    so2: sensorData.pollutants.sulfur_dioksida || null,
    co: sensorData.pollutants.karbon_monoksida || null,
    o3: sensorData.pollutants.ozon || null,
    no2: sensorData.pollutants.nitrogen_dioksida || null,
    category: prediction.category,
    confidence: prediction.confidence || null,
    temperature: sensorData.weather?.suhu || null,
    humidity: sensorData.weather?.kelembapan || null,
    pressure: sensorData.weather?.tekanan || null,
  };

  try {
    const { error } = await supabase
      .from('air_quality_readings')
      .insert(reading);

    if (error) {
      console.error('[History Service] Insert error:', error);
      return false;
    }

    console.log('[History Service] Reading saved successfully');
    return true;
  } catch (error) {
    console.error('[History Service] Failed to save reading:', error);
    return false;
  }
}

/**
 * Fetch historical readings from database
 */
export async function fetchHistoricalReadings(options?: {
  dataSource?: DataSource;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  let query = supabase
    .from('air_quality_readings')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.dataSource) {
    query = query.eq('data_source', options.dataSource);
  }

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  } else {
    query = query.limit(100); // Default limit
  }

  const { data, error } = await query;

  if (error) {
    console.error('[History Service] Fetch error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get daily summary of air quality readings
 */
export async function getDailySummary(daysBack: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('air_quality_readings')
    .select('created_at, category, data_source')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[History Service] Summary error:', error);
    return [];
  }

  return data || [];
}
