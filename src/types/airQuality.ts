// Air Quality Data Types for AirSense

export type AirQualityCategory = 
  | 'BAIK' 
  | 'SEDANG' 
  | 'TIDAK SEHAT' 
  | 'SANGAT TIDAK SEHAT' 
  | 'BERBAHAYA';

export type DataSource = 'iot' | 'openweathermap' | 'openaq';

// Pollutant data for ML mode (ISPU dataset - 7 features)
export interface PollutantData {
  pm_sepuluh: number | null;       // PM10
  pm_duakomalima: number | null;   // PM2.5
  sulfur_dioksida: number | null;  // SO₂
  karbon_monoksida: number | null; // CO
  ozon: number | null;             // O₃
  nitrogen_dioksida: number | null; // NO₂
  max?: number | null;             // MAX - daily critical ISPU value (for ML prediction)
}

// IoT sensor data (MQ-135, DHT22, BMP280)
export interface IoTSensorData {
  gas_index: number;               // MQ-135 - primary parameter for IoT classification
  mq135_raw: number | null;        // MQ-135 raw analog value (0-4095)
  suhu: number | null;             // DHT22 - temperature (supporting info)
  kelembapan: number | null;       // DHT22 - humidity (supporting info)
  tekanan: number | null;          // BMP280 - pressure (supporting info)
  category?: string;               // Category from ESP32 classification
  timestamp?: number;              // Firebase server timestamp
  local_time_s?: number;           // Local time in seconds since ESP32 boot
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
  iotData?: IoTSensorData;         // Only present for IoT mode
  weather?: WeatherData;
  timestamp: Date;
  source: DataSource;
  location?: string;
}

// Prediction result from Decision Tree model or IoT threshold-based classification
export interface PredictionResult {
  category: AirQualityCategory;
  confidence?: number;
  timestamp: Date;
  inputData: PollutantData;
  method: 'ml' | 'threshold';      // Indicates which method was used
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
  apiKey?: string;
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
