import { Cloud, Droplets, Gauge, Thermometer } from 'lucide-react';
import { WeatherData } from '@/types/airQuality';

interface WeatherInfoProps {
  data: WeatherData | null;
}

export function WeatherInfo({ data }: WeatherInfoProps) {
  if (!data) return null;

  const hasData = data.suhu !== null || data.kelembapan !== null || data.tekanan !== null;
  if (!hasData) return null;

  const weatherItems = [
    {
      icon: Cloud,
      label: 'Kondisi',
      value: data.kondisi,
      unit: '',
    },
    {
      icon: Thermometer,
      label: 'Suhu',
      value: data.suhu,
      unit: '°C',
    },
    {
      icon: Droplets,
      label: 'Kelembapan',
      value: data.kelembapan,
      unit: '%',
    },
    {
      icon: Gauge,
      label: 'Tekanan',
      value: data.tekanan,
      unit: 'hPa',
    },
  ].filter(item => item.value !== null);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Cloud className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Informasi Cuaca</h3>
          <p className="text-sm text-muted-foreground">Data cuaca terkini</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {weatherItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col items-center p-4 rounded-xl bg-muted/30 transition-all hover:bg-muted/50"
            >
              <Icon className="h-5 w-5 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground mb-1">{item.label}</span>
              <span className="data-value text-lg font-semibold text-foreground">
                {typeof item.value === 'number' ? item.value : item.value}
                {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
