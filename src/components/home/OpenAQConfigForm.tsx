import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OpenAQConfig } from '@/types/airQuality';

interface OpenAQConfigFormProps {
  config: OpenAQConfig;
  onChange: (config: OpenAQConfig) => void;
}

const indonesianCities = [
  'Jakarta',
  'Bandung',
  'Surabaya',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Tangerang',
  'Depok',
  'Bekasi',
  'Denpasar',
  'Yogyakarta',
];

export function OpenAQConfigForm({ config, onChange }: OpenAQConfigFormProps) {
  return (
    <div className="space-y-6">
      {/* API Key (Optional for OpenAQ but useful for higher rate limits) */}
      <div className="space-y-2">
        <Label htmlFor="openaq-api-key" className="text-sm font-medium">
          OpenAQ API Key (Opsional)
        </Label>
        <Input
          id="openaq-api-key"
          type="password"
          placeholder="Masukkan API key untuk rate limit lebih tinggi"
          value={config.apiKey || ''}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          className="h-12 rounded-xl bg-background border-border"
        />
        <p className="text-xs text-muted-foreground">
          Dapatkan API key di{' '}
          <a 
            href="https://docs.openaq.org/docs/getting-started" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            docs.openaq.org
          </a>
          {' '}(opsional, untuk rate limit lebih tinggi)
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            Kota
          </Label>
          <Select
            value={config.city || 'Jakarta'}
            onValueChange={(value) => onChange({ ...config, city: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-background border-border">
              <SelectValue placeholder="Pilih kota" />
            </SelectTrigger>
            <SelectContent>
              {indonesianCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Pilih kota di Indonesia untuk mendapatkan data kualitas udara
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-city" className="text-sm font-medium">
            Kota Lainnya (Opsional)
          </Label>
          <Input
            id="custom-city"
            type="text"
            placeholder="Ketik nama kota lain"
            value={!indonesianCities.includes(config.city || '') ? config.city : ''}
            onChange={(e) => onChange({ ...config, city: e.target.value })}
            className="h-12 rounded-xl bg-background border-border"
          />
          <p className="text-xs text-muted-foreground">
            Atau ketik nama kota yang tidak ada di daftar
          </p>
        </div>
      </div>
    </div>
  );
}
