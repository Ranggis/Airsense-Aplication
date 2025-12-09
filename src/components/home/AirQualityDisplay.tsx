import { AlertTriangle, CheckCircle, Info, Shield, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PredictionResult, AirQualityCategory } from '@/types/airQuality';
import { getCategoryColorClass, getCategoryRecommendation } from '@/services/predictionService';

interface AirQualityDisplayProps {
  prediction: PredictionResult | null;
  isLoading?: boolean;
}

function getCategoryIcon(category: AirQualityCategory) {
  switch (category) {
    case 'BAIK':
      return CheckCircle;
    case 'SEDANG':
      return Info;
    case 'TIDAK SEHAT':
      return AlertTriangle;
    case 'SANGAT TIDAK SEHAT':
      return Shield;
    case 'BERBAHAYA':
      return Skull;
    default:
      return Info;
  }
}

function getCategoryEmoji(category: AirQualityCategory) {
  switch (category) {
    case 'BAIK': return '🌿';
    case 'SEDANG': return '🌤️';
    case 'TIDAK SEHAT': return '😷';
    case 'SANGAT TIDAK SEHAT': return '⚠️';
    case 'BERBAHAYA': return '☠️';
    default: return '🌍';
  }
}

export function AirQualityDisplay({ prediction, isLoading }: AirQualityDisplayProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-8 text-lg text-muted-foreground animate-pulse">
            Menganalisis kualitas udara...
          </p>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const { category, confidence, timestamp } = prediction;
  const colorClass = getCategoryColorClass(category);
  const recommendation = getCategoryRecommendation(category);
  const Icon = getCategoryIcon(category);
  const emoji = getCategoryEmoji(category);

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Main Display */}
      <div className="relative p-8 sm:p-12 text-center">
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-30">
          <div className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl',
            category === 'BAIK' && 'bg-aq-good',
            category === 'SEDANG' && 'bg-aq-moderate',
            category === 'TIDAK SEHAT' && 'bg-aq-unhealthy-sensitive',
            category === 'SANGAT TIDAK SEHAT' && 'bg-aq-very-unhealthy',
            category === 'BERBAHAYA' && 'bg-aq-hazardous',
          )} />
        </div>

        <div className="relative">
          {/* Emoji */}
          <div className="text-6xl sm:text-7xl mb-6 animate-float">
            {emoji}
          </div>

          {/* Category Badge */}
          <div className={cn(
            'inline-flex items-center gap-3 aq-badge text-xl sm:text-2xl animate-scale-in',
            colorClass
          )}>
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="font-bold">{category}</span>
          </div>

          {/* Confidence & Method */}
          <div className="mt-4 space-y-1">
            {confidence && (
              <p className="text-sm text-muted-foreground">
                Akurasi: <span className="font-semibold text-foreground">{(confidence * 100).toFixed(0)}%</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Metode: <span className="font-medium text-foreground">
                {prediction.method === 'ml' ? 'Machine Learning (Decision Tree)' : 'Threshold-based (IoT)'}
              </span>
            </p>
          </div>

          {/* Timestamp */}
          <p className="mt-2 text-xs text-muted-foreground">
            Diperbarui: {timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="border-t border-border bg-muted/30 px-8 py-6">
        <div className="flex items-start gap-4 max-w-2xl mx-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Rekomendasi</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
