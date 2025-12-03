import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IoTConfig } from '@/types/airQuality';

interface IoTConfigFormProps {
  config: IoTConfig;
  onChange: (config: IoTConfig) => void;
}

export function IoTConfigForm({ config, onChange }: IoTConfigFormProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="firebase-url" className="text-sm font-medium">
          Firebase Realtime Database URL
        </Label>
        <Input
          id="firebase-url"
          type="url"
          placeholder="https://your-project.firebaseio.com"
          value={config.firebaseUrl}
          onChange={(e) => onChange({ ...config, firebaseUrl: e.target.value })}
          className="h-12 rounded-xl bg-background border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data-path" className="text-sm font-medium">
          Path Data Sensor
        </Label>
        <Input
          id="data-path"
          type="text"
          placeholder="/sensor/"
          value={config.dataPath}
          onChange={(e) => onChange({ ...config, dataPath: e.target.value })}
          className="h-12 rounded-xl bg-background border-border font-mono"
        />
      </div>
    </div>
  );
}
