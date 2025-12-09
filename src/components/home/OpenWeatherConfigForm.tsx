import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { OpenWeatherConfig } from '@/types/airQuality';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect } from 'react';
import { CityAutocomplete } from './CityAutocomplete';

interface OpenWeatherConfigFormProps {
  config: OpenWeatherConfig;
  onChange: (config: OpenWeatherConfig) => void;
}

export function OpenWeatherConfigForm({ config, onChange }: OpenWeatherConfigFormProps) {
  const { latitude, longitude, loading, error, getCurrentLocation } = useGeolocation();

  // Update config when location is obtained
  useEffect(() => {
    if (latitude && longitude) {
      onChange({ 
        ...config, 
        lat: latitude, 
        lon: longitude,
        city: '' // Clear city when using coordinates
      });
    }
  }, [latitude, longitude]);

  const handleCitySelect = (city: { name: string; country: string; lat: number; lon: number }) => {
    onChange({
      ...config,
      city: city.name,
      lat: undefined,
      lon: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="api-key" className="text-sm font-medium">
            OpenWeatherMap API Key
          </Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Masukkan API key"
            value={config.apiKey}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            className="h-12 rounded-xl bg-background border-border"
          />
          <p className="text-xs text-muted-foreground">
            Dapatkan API key gratis di{' '}
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              openweathermap.org
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            Nama Kota
          </Label>
          <CityAutocomplete
            value={config.city || ''}
            apiKey={config.apiKey}
            onSelect={handleCitySelect}
            onChange={(value) => onChange({ 
              ...config, 
              city: value,
              lat: undefined,
              lon: undefined
            })}
            disabled={!!config.lat && !!config.lon}
            placeholder="Cari kota..."
          />
          {!config.apiKey && (
            <p className="text-xs text-muted-foreground">
              Masukkan API key untuk mengaktifkan pencarian kota
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Atau Gunakan Lokasi GPS
          </Label>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={loading}
            className="w-full h-12 rounded-xl gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mendapatkan lokasi...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                {config.lat && config.lon 
                  ? `${config.lat.toFixed(4)}, ${config.lon.toFixed(4)}`
                  : 'Gunakan GPS'}
              </>
            )}
          </Button>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {config.lat && config.lon && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...config, lat: undefined, lon: undefined })}
              className="text-xs"
            >
              Reset ke input kota
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
