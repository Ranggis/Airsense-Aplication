import { PredictionResult, AirQualityCategory } from '@/types/airQuality';

interface AQIGaugeProps {
  prediction: PredictionResult | null;
}

const CATEGORY_CONFIG: Record<AirQualityCategory, { color: string; value: number; label: string }> = {
  'BAIK': { color: 'hsl(var(--chart-1))', value: 25, label: '0-50' },
  'SEDANG': { color: 'hsl(var(--chart-2))', value: 75, label: '51-100' },
  'TIDAK SEHAT': { color: 'hsl(var(--chart-3))', value: 125, label: '101-150' },
  'SANGAT TIDAK SEHAT': { color: 'hsl(var(--chart-4))', value: 175, label: '151-200' },
  'BERBAHAYA': { color: 'hsl(var(--chart-5))', value: 250, label: '201-300' },
};

export function AQIGauge({ prediction }: AQIGaugeProps) {
  const category = prediction?.category || 'BAIK';
  const config = CATEGORY_CONFIG[category];
  
  // Calculate rotation angle (0 to 180 degrees)
  const maxValue = 300;
  const rotation = (config.value / maxValue) * 180 - 90;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-center">Indeks Kualitas Udara</h3>
      
      <div className="relative w-64 h-32 mx-auto">
        {/* Background arc */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Gradient segments */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" />
              <stop offset="25%" stopColor="hsl(var(--chart-2))" />
              <stop offset="50%" stopColor="hsl(var(--chart-3))" />
              <stop offset="75%" stopColor="hsl(var(--chart-4))" />
              <stop offset="100%" stopColor="hsl(var(--chart-5))" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Active arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(config.value / maxValue) * 251.2} 251.2`}
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation}, 100, 90)`}>
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="30"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="6" fill="hsl(var(--foreground))" />
          </g>
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span 
            className="text-3xl font-bold"
            style={{ color: config.color }}
          >
            {config.value}
          </span>
          <span className="text-xs text-muted-foreground">AQI</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between mt-4 text-xs">
        <span className="text-muted-foreground">0</span>
        <span 
          className="font-medium px-2 py-1 rounded-full"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {category}
        </span>
        <span className="text-muted-foreground">300</span>
      </div>
    </div>
  );
}
