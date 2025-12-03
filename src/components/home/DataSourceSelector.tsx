import { Database, Cloud, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataSource } from '@/types/airQuality';

interface DataSourceSelectorProps {
  selected: DataSource;
  onSelect: (source: DataSource) => void;
}

const dataSources = [
  {
    id: 'iot' as DataSource,
    name: 'IoT Sensor',
    description: 'Firebase Realtime Database',
    icon: Database,
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500',
  },
  {
    id: 'openweathermap' as DataSource,
    name: 'OpenWeatherMap',
    description: 'Weather & Air Pollution API',
    icon: Cloud,
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-500',
  },
  {
    id: 'openaq' as DataSource,
    name: 'OpenAQ',
    description: 'Global Air Quality Data',
    icon: Globe,
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
  },
];

export function DataSourceSelector({ selected, onSelect }: DataSourceSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {dataSources.map((source) => {
        const isSelected = selected === source.id;
        const Icon = source.icon;
        
        return (
          <button
            key={source.id}
            onClick={() => onSelect(source.id)}
            className={cn(
              'group relative flex flex-col items-center gap-4 rounded-2xl p-6 text-center transition-all duration-300',
              'border-2 bg-card hover:shadow-lg',
              isSelected
                ? `${source.borderColor} bg-gradient-to-br ${source.color}`
                : 'border-border hover:border-primary/30'
            )}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Icon */}
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300',
                isSelected
                  ? `bg-gradient-to-br ${source.color} ${source.iconColor}`
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              <Icon className="h-7 w-7" />
            </div>

            {/* Text */}
            <div>
              <h3 className={cn(
                'font-semibold text-lg transition-colors',
                isSelected ? 'text-foreground' : 'text-foreground/80'
              )}>
                {source.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {source.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
