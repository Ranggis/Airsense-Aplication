import { cn } from '@/lib/utils';
import { PollutantData } from '@/types/airQuality';

interface PollutantCardsProps {
  data: PollutantData | null;
}

const pollutantInfo = [
  {
    key: 'pm_sepuluh' as keyof PollutantData,
    name: 'PM10',
    fullName: 'Particulate Matter 10µm',
    unit: 'µg/m³',
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-500',
  },
  {
    key: 'pm_duakomalima' as keyof PollutantData,
    name: 'PM2.5',
    fullName: 'Particulate Matter 2.5µm',
    unit: 'µg/m³',
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-500',
  },
  {
    key: 'sulfur_dioksida' as keyof PollutantData,
    name: 'SO₂',
    fullName: 'Sulfur Dioksida',
    unit: 'µg/m³',
    color: 'from-yellow-500/20 to-yellow-600/20',
    borderColor: 'border-yellow-500/20',
    textColor: 'text-yellow-500',
  },
  {
    key: 'karbon_monoksida' as keyof PollutantData,
    name: 'CO',
    fullName: 'Karbon Monoksida',
    unit: 'mg/m³',
    color: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-500',
  },
  {
    key: 'ozon' as keyof PollutantData,
    name: 'O₃',
    fullName: 'Ozon',
    unit: 'µg/m³',
    color: 'from-cyan-500/20 to-cyan-600/20',
    borderColor: 'border-cyan-500/20',
    textColor: 'text-cyan-500',
  },
  {
    key: 'nitrogen_dioksida' as keyof PollutantData,
    name: 'NO₂',
    fullName: 'Nitrogen Dioksida',
    unit: 'µg/m³',
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-500',
  },
];

export function PollutantCards({ data }: PollutantCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {pollutantInfo.map((pollutant, index) => {
        const value = data?.[pollutant.key];
        const hasValue = value !== null && value !== undefined;

        return (
          <div
            key={pollutant.key}
            className={cn(
              'group relative rounded-2xl p-5 transition-all duration-300 hover:scale-105',
              'bg-card border border-border hover:border-primary/30',
              'animate-fade-in'
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Gradient Background on Hover */}
            <div className={cn(
              'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity',
              `bg-gradient-to-br ${pollutant.color}`
            )} />

            <div className="relative">
              {/* Pollutant Name */}
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-2xl font-bold', pollutant.textColor)}>
                  {pollutant.name}
                </span>
              </div>

              {/* Value */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="data-value text-3xl font-bold text-foreground">
                    {hasValue ? value.toFixed(pollutant.key === 'karbon_monoksida' ? 1 : 0) : '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pollutant.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {pollutant.fullName}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
