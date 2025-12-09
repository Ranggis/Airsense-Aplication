import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollutantData } from '@/types/airQuality';

interface AQIHeatmapProps {
  currentData: PollutantData | null;
}

interface DayData {
  date: Date;
  value: number;
  category: string;
}

const CATEGORY_COLORS = {
  'BAIK': 'bg-emerald-500',
  'SEDANG': 'bg-yellow-500',
  'TIDAK SEHAT': 'bg-orange-500',
  'SANGAT TIDAK SEHAT': 'bg-red-500',
  'BERBAHAYA': 'bg-purple-900',
};

function getCategory(value: number): string {
  if (value <= 50) return 'BAIK';
  if (value <= 100) return 'SEDANG';
  if (value <= 150) return 'TIDAK SEHAT';
  if (value <= 200) return 'SANGAT TIDAK SEHAT';
  return 'BERBAHAYA';
}

function generateHistoricalData(currentData: PollutantData | null): DayData[] {
  const data: DayData[] = [];
  const today = new Date();
  
  // Generate 28 days of data (4 weeks)
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Base value from current data or random
    const baseValue = currentData?.pm_duakomalima ?? 50;
    // Add some daily variation
    const variation = Math.random() * 60 - 30;
    const value = Math.max(10, Math.min(300, baseValue + variation));
    
    data.push({
      date,
      value: Math.round(value),
      category: getCategory(value),
    });
  }
  
  return data;
}

export function AQIHeatmap({ currentData }: AQIHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  
  const historicalData = useMemo(() => generateHistoricalData(currentData), [currentData]);
  
  // Group by week
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    for (let i = 0; i < historicalData.length; i += 7) {
      result.push(historicalData.slice(i, i + 7));
    }
    return result;
  }, [historicalData]);

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Riwayat Kualitas Udara
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Heatmap 28 hari terakhir berdasarkan PM2.5
        </p>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="flex gap-1 mb-2">
          <div className="w-8" />
          {dayNames.map((day) => (
            <div
              key={day}
              className="flex-1 text-center text-xs text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              <div className="w-8 text-xs text-muted-foreground flex items-center">
                W{weekIndex + 1}
              </div>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex-1 aspect-square rounded-md cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-primary ${
                    CATEGORY_COLORS[day.category as keyof typeof CATEGORY_COLORS]
                  }`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={`${day.date.toLocaleDateString('id-ID')}: AQI ${day.value}`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Tooltip */}
        {hoveredDay && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
            <div className="font-medium">
              {hoveredDay.date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            <div className="text-muted-foreground">
              AQI: {hoveredDay.value} - {hoveredDay.category}
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              <span className="text-xs text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          * Data historis merupakan simulasi
        </p>
      </CardContent>
    </Card>
  );
}
