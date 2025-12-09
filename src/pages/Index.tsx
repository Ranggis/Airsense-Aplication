import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, MapPin, Wind, TrendingUp, Activity, BarChart3, Radar, Calendar, Bell, BellOff, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataSourceSelector } from '@/components/home/DataSourceSelector';
import { IoTConfigForm } from '@/components/home/IoTConfigForm';
import { OpenWeatherConfigForm } from '@/components/home/OpenWeatherConfigForm';
import { OpenAQConfigForm } from '@/components/home/OpenAQConfigForm';
import { AirQualityDisplay } from '@/components/home/AirQualityDisplay';
import { PollutantCards } from '@/components/home/PollutantCards';
import { WeatherInfo } from '@/components/home/WeatherInfo';
import { HeroSection } from '@/components/home/HeroSection';
import { PollutantChart } from '@/components/home/PollutantChart';
import { AQIGauge } from '@/components/home/AQIGauge';
import { PollutantBarChart } from '@/components/home/PollutantBarChart';
import { PollutantRadarChart } from '@/components/home/PollutantRadarChart';
import { AQIHeatmap } from '@/components/home/AQIHeatmap';
import { IoTSensorDisplay } from '@/components/home/IoTSensorDisplay';
import { useAirQualityNotification } from '@/hooks/useNotification';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { 
  DataSource, 
  IoTConfig, 
  OpenWeatherConfig, 
  OpenAQConfig,
  SensorReading,
  PredictionResult,
  AirQualityCategory 
} from '@/types/airQuality';
import { fetchFirebaseData } from '@/services/firebaseService';
import { fetchOpenWeatherData } from '@/services/openWeatherService';
import { fetchOpenAQData } from '@/services/openAQService';
import { predictAirQuality } from '@/services/predictionService';
import { classifyIoTAirQuality } from '@/services/iotClassificationService';
import { sendTelegramAlert } from '@/services/telegramService';
import { saveAirQualityReading } from '@/services/historyService';
import { toast } from 'sonner';

// Store results per data source to preserve data when switching
interface DataSourceResults {
  iot: { sensorData: SensorReading | null; prediction: PredictionResult | null };
  openweathermap: { sensorData: SensorReading | null; prediction: PredictionResult | null };
  openaq: { sensorData: SensorReading | null; prediction: PredictionResult | null };
}

export default function Index() {
  const [dataSource, setDataSource] = useState<DataSource>('openaq');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  
  // Store results for each data source separately
  const [results, setResults] = useState<DataSourceResults>({
    iot: { sensorData: null, prediction: null },
    openweathermap: { sensorData: null, prediction: null },
    openaq: { sensorData: null, prediction: null },
  });

  // Get current data source results
  const currentResult = results[dataSource];
  const sensorData = currentResult.sensorData;
  const prediction = currentResult.prediction;
  
  // Config states
  const [iotConfig, setIoTConfig] = useState<IoTConfig>({
    firebaseUrl: '',
    dataPath: '/sensor/',
  });
  const [owmConfig, setOwmConfig] = useState<OpenWeatherConfig>({
    apiKey: '',
    city: 'Jakarta',
  });
  const [openaqConfig, setOpenaqConfig] = useState<OpenAQConfig>({
    city: 'Jakarta',
    country: 'ID',
  });

  // Notification hook
  const { notify } = useAirQualityNotification();
  const previousCategory = useRef<AirQualityCategory | null>(null);

  const handleFetchAndPredict = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let data: SensorReading;

      // Fetch data based on selected source
      switch (dataSource) {
        case 'iot':
          data = await fetchFirebaseData(iotConfig);
          break;
        case 'openweathermap':
          data = await fetchOpenWeatherData(owmConfig);
          break;
        case 'openaq':
          data = await fetchOpenAQData(openaqConfig);
          break;
        default:
          throw new Error('Sumber data tidak valid');
      }

      // Run prediction/classification based on data source
      let result: PredictionResult;
      
      if (dataSource === 'iot' && data.iotData) {
        // IoT mode: Use threshold-based classification (NO ML API call)
        result = classifyIoTAirQuality(data.iotData);
        console.log('[Index] IoT classification (threshold-based):', result.category);
      } else {
        // ML mode: Use Hugging Face Decision Tree model
        result = await predictAirQuality(data.pollutants);
        console.log('[Index] ML prediction:', result.category);
      }

      // Update results for this data source only
      setResults(prev => ({
        ...prev,
        [dataSource]: { sensorData: data, prediction: result }
      }));

      // Save to database for historical tracking
      saveAirQualityReading(data, result, dataSource)
        .then(saved => {
          if (saved) {
            console.log('[Index] Reading saved to database');
          }
        })
        .catch(err => console.error('[Index] Failed to save reading:', err));

      // Check for category change and notify (toast)
      notify(previousCategory.current, result.category);

      // Determine location for telegram
      const telegramLocation = data.location || (
        dataSource === 'iot' ? 'IoT Sensor' : 
        dataSource === 'openweathermap' ? (owmConfig.city || `GPS: ${owmConfig.lat?.toFixed(4)}, ${owmConfig.lon?.toFixed(4)}`) : 
        `${openaqConfig.city || 'Unknown'}, ${openaqConfig.country || ''}`
      );

      // Send Telegram alert immediately on every analysis if enabled
      if (telegramEnabled) {
        sendTelegramAlert(
          result.category,
          previousCategory.current,
          telegramLocation,
          data.pollutants,
          dataSource
        ).then(() => {
          toast.success('Notifikasi Telegram terkirim');
        }).catch(err => {
          console.error('[Index] Failed to send Telegram alert:', err);
          toast.error('Gagal mengirim notifikasi Telegram');
        });
      }

      previousCategory.current = result.category;

      toast.success('Data berhasil diambil', {
        description: `Lokasi: ${data.location || (dataSource === 'iot' ? 'IoT Sensor' : 
                       dataSource === 'openweathermap' ? owmConfig.city : 
                       openaqConfig.city)}`,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, iotConfig, owmConfig, openaqConfig, notify, telegramEnabled]);

  // Auto refresh hook (1 minute = 60000ms)
  useAutoRefresh({
    interval: 60000,
    enabled: autoRefreshEnabled && !isLoading,
    onRefresh: handleFetchAndPredict,
  });

  // Show countdown for next refresh
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (!autoRefreshEnabled) {
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
              
              {/* Data Source Selection */}
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Pilih Sumber Data
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Pilih sumber data untuk analisis kualitas udara
                  </p>
                </div>
                <DataSourceSelector
                  selected={dataSource}
                  onSelect={setDataSource}
                />
              </div>

              {/* Configuration Form */}
              <div 
                className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Konfigurasi</h3>
                        <p className="text-sm text-muted-foreground">
                          {dataSource === 'iot' ? 'Firebase Realtime Database' : 
                           dataSource === 'openweathermap' ? 'OpenWeatherMap API' : 
                           'OpenAQ API'}
                        </p>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Telegram Toggle */}
                      <div className="flex items-center gap-2">
                        {telegramEnabled ? (
                          <Bell className="h-4 w-4 text-primary" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="telegram-toggle" className="text-sm cursor-pointer">
                          Telegram
                        </Label>
                        <Switch
                          id="telegram-toggle"
                          checked={telegramEnabled}
                          onCheckedChange={setTelegramEnabled}
                        />
                      </div>

                      {/* Auto Refresh Toggle */}
                      <div className="flex items-center gap-2">
                        {autoRefreshEnabled ? (
                          <Play className="h-4 w-4 text-primary" />
                        ) : (
                          <Pause className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                          Auto ({countdown}s)
                        </Label>
                        <Switch
                          id="auto-refresh"
                          checked={autoRefreshEnabled}
                          onCheckedChange={setAutoRefreshEnabled}
                        />
                      </div>
                    </div>
                  </div>

                  {dataSource === 'iot' && (
                    <IoTConfigForm config={iotConfig} onChange={setIoTConfig} />
                  )}
                  {dataSource === 'openweathermap' && (
                    <OpenWeatherConfigForm config={owmConfig} onChange={setOwmConfig} />
                  )}
                  {dataSource === 'openaq' && (
                    <OpenAQConfigForm config={openaqConfig} onChange={setOpenaqConfig} />
                  )}

                  <Button
                    onClick={handleFetchAndPredict}
                    disabled={isLoading}
                    size="lg"
                    className="w-full gap-3 h-14 text-base font-semibold rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5" />
                        Analisis Kualitas Udara
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Results Section */}
              {(prediction || isLoading) && (
                <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  {/* Main Result Row */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Air Quality Result */}
                    <AirQualityDisplay prediction={prediction} isLoading={isLoading} />
                    
                    {/* AQI Gauge */}
                    <AQIGauge prediction={prediction} />
                  </div>

                  {/* Weather Info */}
                  {sensorData?.weather && (
                    <WeatherInfo data={sensorData.weather} />
                  )}

                  {/* IoT Sensor Display (for IoT mode) OR Pollutant Cards (for ML mode) */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Wind className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {dataSource === 'iot' ? 'Data Sensor IoT' : 'Parameter Polutan'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dataSource === 'iot' 
                            ? 'MQ-135 (klasifikasi), DHT22 & BMP280 (pendukung)'
                            : `Data polutan dari ${sensorData?.location || 'lokasi terpilih'}`
                          }
                        </p>
                      </div>
                    </div>
                    {dataSource === 'iot' && sensorData?.iotData ? (
                      <IoTSensorDisplay data={sensorData.iotData} category={prediction?.category} />
                    ) : (
                      <PollutantCards data={sensorData?.pollutants ?? null} />
                    )}
                  </div>

                  {/* Visualizations Grid */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Visualisasi Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Analisis visual kualitas udara
                        </p>
                      </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <PollutantBarChart data={sensorData?.pollutants ?? null} />
                      <PollutantRadarChart data={sensorData?.pollutants ?? null} />
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Time Series Chart */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Grafik Riwayat</span>
                        </div>
                        <PollutantChart currentData={sensorData?.pollutants ?? null} />
                      </div>

                      {/* Heatmap */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Kalender Kualitas</span>
                        </div>
                        <AQIHeatmap currentData={sensorData?.pollutants ?? null} />
                      </div>
                    </div>
                  </div>

                  {/* Data Info */}
                  {sensorData && (
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Sumber: {sensorData.source === 'iot' ? 'IoT Sensor' :
                                 sensorData.source === 'openweathermap' ? 'OpenWeatherMap' :
                                 'OpenAQ'}
                      </span>
                      <span>•</span>
                      <span>
                        Update: {sensorData.timestamp.toLocaleString('id-ID')}
                      </span>
                      {autoRefreshEnabled && (
                        <>
                          <span>•</span>
                          <span className="text-primary">
                            Auto-refresh aktif
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!prediction && !isLoading && (
                <div 
                  className="text-center py-16 animate-fade-in"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                    <Wind className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Belum ada data
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground/70">
                    Pilih sumber data dan klik "Analisis Kualitas Udara" untuk memulai
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
