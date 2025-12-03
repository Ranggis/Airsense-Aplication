/**
 * OpenWeatherMap API Service
 * 
 * This service handles fetching weather and air pollution data from OpenWeatherMap API.
 * 
 * API Documentation:
 * - Weather: https://openweathermap.org/current
 * - Air Pollution: https://openweathermap.org/api/air-pollution
 */

import { 
  OpenWeatherConfig, 
  PollutantData, 
  WeatherData, 
  SensorReading 
} from '@/types/airQuality';

const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_API_BASE = 'https://api.openweathermap.org/geo/1.0';

interface GeocodingResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

interface AirPollutionApiResponse {
  list: Array<{
    components: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
    };
  }>;
}

/**
 * Translate weather condition to Indonesian
 */
function translateWeatherCondition(condition: string): string {
  const translations: Record<string, string> = {
    'Clear': 'Cerah',
    'Clouds': 'Berawan',
    'Rain': 'Hujan',
    'Drizzle': 'Gerimis',
    'Thunderstorm': 'Badai Petir',
    'Snow': 'Salju',
    'Mist': 'Kabut',
    'Fog': 'Kabut Tebal',
    'Haze': 'Kabut Asap',
    'Dust': 'Berdebu',
    'Sand': 'Berpasir',
    'Smoke': 'Berasap',
  };
  return translations[condition] || condition;
}

/**
 * Get coordinates from city name using Geocoding API
 */
async function getCoordinates(
  city: string, 
  apiKey: string
): Promise<GeocodingResult> {
  const url = `${GEO_API_BASE}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.length) {
    throw new Error(`Kota "${city}" tidak ditemukan`);
  }
  
  return data[0];
}

/**
 * Fetch current weather data
 */
async function fetchWeatherData(
  lat: number, 
  lon: number, 
  apiKey: string
): Promise<WeatherData> {
  const url = `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('API key tidak valid');
    }
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data: WeatherApiResponse = await response.json();
  
  return {
    suhu: Math.round(data.main.temp * 10) / 10,
    kelembapan: data.main.humidity,
    tekanan: data.main.pressure,
    kondisi: translateWeatherCondition(data.weather[0]?.main || 'Unknown'),
    icon: data.weather[0]?.icon
  };
}

/**
 * Fetch air pollution data
 */
async function fetchAirPollutionData(
  lat: number, 
  lon: number, 
  apiKey: string
): Promise<PollutantData> {
  const url = `${WEATHER_API_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    console.warn('[OpenWeather Service] Air pollution API failed:', response.status);
    // Return null values if air pollution data is not available
    return {
      pm_sepuluh: null,
      pm_duakomalima: null,
      sulfur_dioksida: null,
      karbon_monoksida: null,
      ozon: null,
      nitrogen_dioksida: null,
    };
  }
  
  const data: AirPollutionApiResponse = await response.json();
  const components = data.list[0]?.components;
  
  if (!components) {
    return {
      pm_sepuluh: null,
      pm_duakomalima: null,
      sulfur_dioksida: null,
      karbon_monoksida: null,
      ozon: null,
      nitrogen_dioksida: null,
    };
  }
  
  return {
    pm_sepuluh: Math.round(components.pm10 * 10) / 10,
    pm_duakomalima: Math.round(components.pm2_5 * 10) / 10,
    sulfur_dioksida: Math.round(components.so2 * 10) / 10,
    karbon_monoksida: Math.round(components.co / 1000 * 10) / 10, // Convert to mg/m³
    ozon: Math.round(components.o3 * 10) / 10,
    nitrogen_dioksida: Math.round(components.no2 * 10) / 10,
  };
}

/**
 * Fetch complete data from OpenWeatherMap
 * 
 * @param config - OpenWeatherMap configuration
 * @returns SensorReading with pollutant and weather data
 */
export async function fetchOpenWeatherData(
  config: OpenWeatherConfig
): Promise<SensorReading> {
  // Validate configuration
  if (!config.apiKey) {
    throw new Error('API key OpenWeatherMap harus diisi');
  }
  
  if (!config.city && (config.lat === undefined || config.lon === undefined)) {
    throw new Error('Nama kota atau koordinat (lat/lon) harus diisi');
  }

  let lat: number;
  let lon: number;

  // Get coordinates from city name if not provided
  if (config.city) {
    console.log('[OpenWeather Service] Getting coordinates for:', config.city);
    const geo = await getCoordinates(config.city, config.apiKey);
    lat = geo.lat;
    lon = geo.lon;
    console.log('[OpenWeather Service] Found coordinates:', lat, lon);
  } else {
    lat = config.lat!;
    lon = config.lon!;
  }

  // Fetch weather and air pollution data in parallel
  const [weather, pollutants] = await Promise.all([
    fetchWeatherData(lat, lon, config.apiKey),
    fetchAirPollutionData(lat, lon, config.apiKey)
  ]);

  console.log('[OpenWeather Service] Weather data:', weather);
  console.log('[OpenWeather Service] Pollutant data:', pollutants);

  return {
    pollutants,
    weather,
    timestamp: new Date(),
    source: 'openweathermap'
  };
}
