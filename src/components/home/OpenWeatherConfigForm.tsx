import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OpenWeatherConfig } from '@/types/airQuality';

interface OpenWeatherConfigFormProps {
  config: OpenWeatherConfig;
  onChange: (config: OpenWeatherConfig) => void;
}

export function OpenWeatherConfigForm({ config, onChange }: OpenWeatherConfigFormProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
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
        <Input
          id="city"
          type="text"
          placeholder="Jakarta"
          value={config.city || ''}
          onChange={(e) => onChange({ ...config, city: e.target.value })}
          className="h-12 rounded-xl bg-background border-border"
        />
      </div>
    </div>
  );
}
