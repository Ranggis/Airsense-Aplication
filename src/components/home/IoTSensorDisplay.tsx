/**
 * IoT Sensor Display Component
 * 
 * Displays IoT sensor data (MQ-135 gas_index, DHT22 temp/humidity, BMP280 pressure)
 * Only shown for IoT mode - replaces PollutantCards for IoT data source
 */

import { Wind, Thermometer, Droplets, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { IoTSensorData, AirQualityCategory } from '@/types/airQuality';
import { cn } from '@/lib/utils';

interface IoTSensorDisplayProps {
  data: IoTSensorData | null;
  category?: AirQualityCategory;
}

function getGasIndexColor(gasIndex: number): string {
  if (gasIndex < 100) return 'text-aq-good';
  if (gasIndex < 200) return 'text-aq-moderate';
  return 'text-aq-unhealthy-sensitive';
}

function getGasIndexBg(gasIndex: number): string {
  if (gasIndex < 100) return 'bg-aq-good/10';
  if (gasIndex < 200) return 'bg-aq-moderate/10';
  return 'bg-aq-unhealthy-sensitive/10';
}

export function IoTSensorDisplay({ data, category }: IoTSensorDisplayProps) {
  if (!data) return null;

  const sensors = [
    {
      key: 'gas_index',
      name: 'Gas Index',
      fullName: 'MQ-135 Air Quality',
      value: data.gas_index,
      unit: '',
      icon: Wind,
      isPrimary: true,
      description: 'Parameter utama untuk klasifikasi',
    },
    {
      key: 'suhu',
      name: 'Suhu',
      fullName: 'DHT22 Temperature',
      value: data.suhu,
      unit: '°C',
      icon: Thermometer,
      isPrimary: false,
      description: 'Informasi pendukung',
    },
    {
      key: 'kelembapan',
      name: 'Kelembapan',
      fullName: 'DHT22 Humidity',
      value: data.kelembapan,
      unit: '%',
      icon: Droplets,
      isPrimary: false,
      description: 'Informasi pendukung',
    },
    {
      key: 'tekanan',
      name: 'Tekanan',
      fullName: 'BMP280 Pressure',
      value: data.tekanan,
      unit: 'hPa',
      icon: Gauge,
      isPrimary: false,
      description: 'Informasi pendukung',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sensors.map((sensor) => {
        const Icon = sensor.icon;
        const isGasIndex = sensor.key === 'gas_index';
        
        return (
          <Card 
            key={sensor.key}
            className={cn(
              'glass-card p-4 transition-all hover:scale-[1.02]',
              isGasIndex && 'sm:col-span-2 lg:col-span-1 ring-2 ring-primary/20'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {sensor.name}
                  {isGasIndex && <span className="ml-1 text-primary">(Utama)</span>}
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  isGasIndex ? getGasIndexColor(data.gas_index) : 'text-foreground'
                )}>
                  {sensor.value !== null ? (
                    <>
                      {sensor.value.toFixed(sensor.key === 'tekanan' ? 1 : 0)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {sensor.unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                isGasIndex ? getGasIndexBg(data.gas_index) : 'bg-muted'
              )}>
                <Icon className={cn(
                  'h-5 w-5',
                  isGasIndex ? getGasIndexColor(data.gas_index) : 'text-muted-foreground'
                )} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {sensor.fullName}
            </p>
            {isGasIndex && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Threshold: &lt;100 (Baik), 100-199 (Sedang), ≥200 (Tidak Sehat)
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
