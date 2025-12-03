import { useState, useRef } from 'react';
import { Loader2, RefreshCw, MapPin, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useAirQualityNotification } from '@/hooks/useNotification';
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
import { toast } from 'sonner';

export default function Index() {
  const [dataSource, setDataSource] = useState<DataSource>('openaq');
  const [isLoading, setIsLoading] = useState(false);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  
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

  const handleFetchAndPredict = async () => {
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

      setSensorData(data);

      // Run prediction
      const result = await predictAirQuality(data.pollutants);
      setPrediction(result);

      // Check for category change and notify
      notify(previousCategory.current, result.category);
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
              
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
                  {/* Air Quality Result */}
                  <AirQualityDisplay prediction={prediction} isLoading={isLoading} />

                  {/* Weather Info */}
                  {sensorData?.weather && (
                    <WeatherInfo data={sensorData.weather} />
                  )}

                  {/* Pollutant Cards */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Wind className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Parameter Polutan</h3>
                        <p className="text-sm text-muted-foreground">
                          Data polutan dari {sensorData?.location || 'lokasi terpilih'}
                        </p>
                      </div>
                    </div>
                    <PollutantCards data={sensorData?.pollutants ?? null} />
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
