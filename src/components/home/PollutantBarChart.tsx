import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollutantData } from '@/types/airQuality';

interface PollutantBarChartProps {
  data: PollutantData | null;
}

const POLLUTANT_STANDARDS = {
  pm_sepuluh: { max: 150, label: 'PM10', unit: 'µg/m³' },
  pm_duakomalima: { max: 75, label: 'PM2.5', unit: 'µg/m³' },
  sulfur_dioksida: { max: 125, label: 'SO₂', unit: 'µg/m³' },
  karbon_monoksida: { max: 10, label: 'CO', unit: 'mg/m³' },
  ozon: { max: 120, label: 'O₃', unit: 'µg/m³' },
  nitrogen_dioksida: { max: 200, label: 'NO₂', unit: 'µg/m³' },
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

export function PollutantBarChart({ data }: PollutantBarChartProps) {
  if (!data) return null;

  const chartData = Object.entries(POLLUTANT_STANDARDS).map(([key, standard]) => {
    const value = data[key as keyof PollutantData] ?? 0;
    const percentage = (value / standard.max) * 100;
    
    return {
      name: standard.label,
      value: value,
      percentage: Math.min(percentage, 100),
      max: standard.max,
      unit: standard.unit,
    };
  });

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Perbandingan Polutan vs Batas Aman
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Persentase terhadap standar batas aman WHO/BMKG
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string, props: { payload: { value: number; unit: string; max: number } }) => [
                  `${props.payload.value} ${props.payload.unit} (${value.toFixed(1)}% dari batas ${props.payload.max})`,
                  'Nilai'
                ]}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Reference line indicator */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <div className="w-px h-4 bg-destructive" />
          <span>100% = Batas aman</span>
        </div>
      </CardContent>
    </Card>
  );
}
