import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollutantData } from '@/types/airQuality';

interface PollutantRadarChartProps {
  data: PollutantData | null;
}

const POLLUTANT_CONFIG = {
  pm_sepuluh: { max: 150, label: 'PM10' },
  pm_duakomalima: { max: 75, label: 'PM2.5' },
  sulfur_dioksida: { max: 125, label: 'SO₂' },
  karbon_monoksida: { max: 10, label: 'CO' },
  ozon: { max: 120, label: 'O₃' },
  nitrogen_dioksida: { max: 200, label: 'NO₂' },
};

export function PollutantRadarChart({ data }: PollutantRadarChartProps) {
  if (!data) return null;

  const chartData = Object.entries(POLLUTANT_CONFIG).map(([key, config]) => {
    const value = data[key as keyof PollutantData] ?? 0;
    const normalized = Math.min((value / config.max) * 100, 100);
    
    return {
      subject: config.label,
      value: normalized,
      rawValue: value,
      max: config.max,
    };
  });

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Profil Polutan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualisasi multi-dimensi kadar polutan
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string, props: { payload: { rawValue: number; max: number } }) => [
                  `${props.payload.rawValue} (${value.toFixed(1)}% dari batas ${props.payload.max})`,
                  'Nilai'
                ]}
              />
              <Radar
                name="Polutan"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
