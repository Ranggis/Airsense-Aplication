/**
 * OpenAQ API Service
 * 
 * This service handles fetching air quality data from OpenAQ API.
 * OpenAQ is a global open-source platform for air quality data.
 * API Documentation: https://docs.openaq.org/
 */

import { OpenAQConfig, PollutantData, SensorReading } from '@/types/airQuality';

const OPENAQ_BASE_URL = 'https://api.openaq.org/v2';

/**
 * Map OpenAQ parameter names to our standard format
 */
const PARAMETER_MAPPING: Record<string, keyof PollutantData> = {
  'pm10': 'pm_sepuluh',
  'pm25': 'pm_duakomalima',
  'so2': 'sulfur_dioksida',
  'co': 'karbon_monoksida',
  'o3': 'ozon',
  'no2': 'nitrogen_dioksida',
};

interface OpenAQMeasurement {
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
}

interface OpenAQLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  measurements: OpenAQMeasurement[];
}

interface OpenAQResponse {
  results: OpenAQLocation[];
}

/**
 * Fetch air quality data from OpenAQ API
 */
export async function fetchOpenAQData(config: OpenAQConfig): Promise<SensorReading> {
  console.log('[OpenAQ Service] Fetching data with config:', config);

  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', '10');
    params.append('order_by', 'lastUpdated');
    params.append('sort', 'desc');
    
    if (config.city) {
      params.append('city', config.city);
    }
    
    if (config.country) {
      params.append('country', config.country);
    }
    
    if (config.coordinates) {
      params.append('coordinates', `${config.coordinates.latitude},${config.coordinates.longitude}`);
      params.append('radius', String(config.radius || 25000)); // Default 25km radius
    }

    const url = `${OPENAQ_BASE_URL}/latest?${params.toString()}`;
    console.log('[OpenAQ Service] Request URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAQ API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAQResponse = await response.json();
    console.log('[OpenAQ Service] Response:', data);

    if (!data.results || data.results.length === 0) {
      console.warn('[OpenAQ Service] No data found, using simulated data');
      return getSimulatedData(config);
    }

    // Aggregate data from all locations
    const pollutants: PollutantData = {
      pm_sepuluh: null,
      pm_duakomalima: null,
      sulfur_dioksida: null,
      karbon_monoksida: null,
      ozon: null,
      nitrogen_dioksida: null,
    };

    let locationName = config.city || 'Unknown';
    let latestTimestamp = new Date();

    for (const location of data.results) {
      if (location.city) {
        locationName = location.city;
      }

      for (const measurement of location.measurements) {
        const paramKey = PARAMETER_MAPPING[measurement.parameter];
        if (paramKey && pollutants[paramKey] === null) {
          // Convert units if necessary (OpenAQ uses different units)
          let value = measurement.value;
          
          // CO is often in ppm, convert to mg/m³
          if (measurement.parameter === 'co' && measurement.unit === 'ppm') {
            value = value * 1.145; // Approximate conversion
          }
          
          pollutants[paramKey] = Math.round(value * 10) / 10;
        }

        const measurementDate = new Date(measurement.lastUpdated);
        if (measurementDate > latestTimestamp) {
          latestTimestamp = measurementDate;
        }
      }
    }

    console.log('[OpenAQ Service] Extracted pollutants:', pollutants);

    return {
      pollutants,
      timestamp: latestTimestamp,
      source: 'openaq',
      location: locationName,
    };
  } catch (error) {
    console.warn('[OpenAQ Service] API call failed, using simulated data:', error);
    return getSimulatedData(config);
  }
}

/**
 * Get simulated data when API fails or no data available
 * This is for demonstration purposes
 */
function getSimulatedData(config: OpenAQConfig): SensorReading {
  // Simulate realistic air quality data for Indonesian cities
  const baseValues = {
    pm_sepuluh: 45 + Math.random() * 60,
    pm_duakomalima: 25 + Math.random() * 45,
    sulfur_dioksida: 10 + Math.random() * 30,
    karbon_monoksida: 0.5 + Math.random() * 2,
    ozon: 30 + Math.random() * 50,
    nitrogen_dioksida: 15 + Math.random() * 40,
  };

  return {
    pollutants: {
      pm_sepuluh: Math.round(baseValues.pm_sepuluh),
      pm_duakomalima: Math.round(baseValues.pm_duakomalima),
      sulfur_dioksida: Math.round(baseValues.sulfur_dioksida),
      karbon_monoksida: Math.round(baseValues.karbon_monoksida * 10) / 10,
      ozon: Math.round(baseValues.ozon),
      nitrogen_dioksida: Math.round(baseValues.nitrogen_dioksida),
    },
    timestamp: new Date(),
    source: 'openaq',
    location: config.city || 'Jakarta',
  };
}

/**
 * Get list of available cities in Indonesia from OpenAQ
 */
export async function getAvailableCities(): Promise<string[]> {
  try {
    const response = await fetch(`${OPENAQ_BASE_URL}/cities?country=ID&limit=100`);
    const data = await response.json();
    return data.results?.map((city: { city: string }) => city.city) || [];
  } catch (error) {
    console.error('[OpenAQ Service] Failed to fetch cities:', error);
    return ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Denpasar'];
  }
}
