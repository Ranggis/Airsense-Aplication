// Air Quality Data Types for AirSense

export type AirQualityCategory = 
  | 'BAIK' 
  | 'SEDANG' 
  | 'TIDAK SEHAT' 
  | 'SANGAT TIDAK SEHAT' 
  | 'BERBAHAYA';

export type DataSource = 'iot' | 'openweathermap' | 'openaq';

// Pollutant data from sensors
export interface PollutantData {
  pm_sepuluh: number | null;       // PM10
  pm_duakomalima: number | null;   // PM2.5
  sulfur_dioksida: number | null;  // SO₂
  karbon_monoksida: number | null; // CO
  ozon: number | null;             // O₃
  nitrogen_dioksida: number | null; // NO₂
}

// Weather data (optional, from OpenWeatherMap)
export interface WeatherData {
  suhu: number | null;             // Temperature (°C)
  kelembapan: number | null;       // Humidity (%)
  tekanan: number | null;          // Pressure (hPa)
  kondisi: string | null;          // Weather condition description
  icon?: string;                   // Weather icon code
}

// Combined sensor reading
export interface SensorReading {
  pollutants: PollutantData;
  weather?: WeatherData;
  timestamp: Date;
  source: DataSource;
  location?: string;
}

// Prediction result from Decision Tree model
export interface PredictionResult {
  category: AirQualityCategory;
  confidence?: number;
  timestamp: Date;
  inputData: PollutantData;
}

// Configuration for different data sources
export interface IoTConfig {
  firebaseUrl: string;
  dataPath: string;
}

export interface OpenWeatherConfig {
  apiKey: string;
  city?: string;
  lat?: number;
  lon?: number;
}

export interface OpenAQConfig {
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
}

// Notification for air quality changes
export interface AirQualityNotification {
  id: string;
  previousCategory: AirQualityCategory;
  newCategory: AirQualityCategory;
  message: string;
  timestamp: Date;
  isImprovement: boolean;
}
