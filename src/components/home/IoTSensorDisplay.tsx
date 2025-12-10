/**
 * IoT Sensor Display Component
 * 
 * Displays all IoT sensor data from ESP32:
 * - MQ-135: gas_index (primary for classification) + mq135_raw
 * - DHT22: temperature, humidity
 * - BMP280: pressure
 * - Category from ESP32
 * - Timestamp info
 */

import { Wind, Thermometer, Droplets, Gauge, Cpu, Clock, Activity } from 'lucide-react';
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

function getCategoryColor(category: string): string {
  switch (category) {
    case 'BAIK': return 'text-aq-good';
    case 'SEDANG': return 'text-aq-moderate';
    case 'TIDAK SEHAT': return 'text-aq-unhealthy-sensitive';
    default: return 'text-foreground';
  }
}

export function IoTSensorDisplay({ data, category }: IoTSensorDisplayProps) {
  if (!data) return null;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Sensor Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Gas Index - Primary */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02] ring-2 ring-primary/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Gas Index <span className="text-primary">(Utama)</span>
              </p>
              <p className={cn('text-3xl font-bold', getGasIndexColor(data.gas_index))}>
                {data.gas_index.toFixed(2)}
              </p>
            </div>
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              getGasIndexBg(data.gas_index)
            )}>
              <Wind className={cn('h-6 w-6', getGasIndexColor(data.gas_index))} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            MQ-135 Air Quality Sensor
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Threshold: &lt;100 (Baik), 100-199 (Sedang), ≥200 (Tidak Sehat)
            </p>
          </div>
        </Card>

        {/* MQ-135 Raw */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">MQ-135 Raw</p>
              <p className="text-2xl font-bold text-foreground">
                {data.mq135_raw !== null ? data.mq135_raw.toFixed(0) : '—'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Cpu className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Analog Value (0-4095)
          </p>
        </Card>

        {/* ESP32 Category */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Kategori ESP32</p>
              <p className={cn('text-2xl font-bold', getCategoryColor(data.category || ''))}>
                {data.category || '—'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Klasifikasi dari mikrokontroler
          </p>
        </Card>

        {/* Temperature */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Suhu</p>
              <p className="text-2xl font-bold text-foreground">
                {data.suhu !== null ? (
                  <>
                    {data.suhu.toFixed(1)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">°C</span>
                  </>
                ) : '—'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Thermometer className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            DHT22 Temperature
          </p>
        </Card>

        {/* Humidity */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Kelembapan</p>
              <p className="text-2xl font-bold text-foreground">
                {data.kelembapan !== null ? (
                  <>
                    {data.kelembapan.toFixed(1)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
                  </>
                ) : '—'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            DHT22 Humidity
          </p>
        </Card>

        {/* Pressure */}
        <Card className="glass-card p-4 transition-all hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Tekanan</p>
              <p className="text-2xl font-bold text-foreground">
                {data.tekanan !== null ? (
                  <>
                    {data.tekanan.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">hPa</span>
                  </>
                ) : '—'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Gauge className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            BMP280 Pressure
          </p>
        </Card>
      </div>

      {/* Timestamp Info */}
      {data.timestamp && (
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Waktu Data Firebase</p>
              <p className="text-sm font-medium">{formatTimestamp(data.timestamp)}</p>
            </div>
            {data.local_time_s !== undefined && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">ESP32 Uptime</p>
                <p className="text-sm font-medium">{data.local_time_s}s</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
