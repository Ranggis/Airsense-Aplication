import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollutantData } from '@/types/airQuality';

interface ChartDataPoint {
  time: string;
  PM10: number;
  'PM2.5': number;
  SO2: number;
  CO: number;
  O3: number;
  NO2: number;
}

interface PollutantChartProps {
  currentData: PollutantData | null;
}

const POLLUTANT_COLORS = {
  PM10: 'hsl(var(--chart-1))',
  'PM2.5': 'hsl(var(--chart-2))',
  SO2: 'hsl(var(--chart-3))',
  CO: 'hsl(var(--chart-4))',
  O3: 'hsl(var(--chart-5))',
  NO2: 'hsl(var(--primary))',
};

// Generate mock historical data based on current reading
const generateHistoricalData = (
  currentData: PollutantData | null,
  timeRange: 'hourly' | 'daily'
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const points = timeRange === 'hourly' ? 24 : 7;
  const now = new Date();

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now);
    if (timeRange === 'hourly') {
      time.setHours(time.getHours() - i);
    } else {
      time.setDate(time.getDate() - i);
    }

    // Generate variation around current values or use random defaults
    const baseValues = {
      pm10: currentData?.pm_sepuluh ?? 50,
      pm25: currentData?.pm_duakomalima ?? 25,
      so2: currentData?.sulfur_dioksida ?? 10,
      co: currentData?.karbon_monoksida ?? 500,
      o3: currentData?.ozon ?? 40,
      no2: currentData?.nitrogen_dioksida ?? 20,
    };

    const variation = () => 0.7 + Math.random() * 0.6; // 70% - 130% variation

    data.push({
      time: timeRange === 'hourly' 
        ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      PM10: Math.round(baseValues.pm10 * variation()),
      'PM2.5': Math.round(baseValues.pm25 * variation()),
      SO2: Math.round(baseValues.so2 * variation() * 10) / 10,
      CO: Math.round(baseValues.co * variation()),
      O3: Math.round(baseValues.o3 * variation()),
      NO2: Math.round(baseValues.no2 * variation()),
    });
  }

  return data;
};

export function PollutantChart({ currentData }: PollutantChartProps) {
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily'>('hourly');
  const [selectedPollutants, setSelectedPollutants] = useState<string[]>([
    'PM10',
    'PM2.5',
  ]);

  const chartData = generateHistoricalData(currentData, timeRange);

  const togglePollutant = (pollutant: string) => {
    setSelectedPollutants((prev) =>
      prev.includes(pollutant)
        ? prev.filter((p) => p !== pollutant)
        : [...prev, pollutant]
    );
  };

  const pollutantButtons = [
    { key: 'PM10', label: 'PM10' },
    { key: 'PM2.5', label: 'PM2.5' },
    { key: 'SO2', label: 'SO₂' },
    { key: 'CO', label: 'CO' },
    { key: 'O3', label: 'O₃' },
    { key: 'NO2', label: 'NO₂' },
  ];

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            Riwayat Data Polutan
          </CardTitle>
          <Tabs
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as 'hourly' | 'daily')}
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="hourly">Per Jam</TabsTrigger>
              <TabsTrigger value="daily">Per Hari</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pollutant Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {pollutantButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => togglePollutant(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedPollutants.includes(key)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                )}
              />
              {selectedPollutants.includes('PM10') && (
                <Line
                  type="monotone"
                  dataKey="PM10"
                  stroke={POLLUTANT_COLORS.PM10}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS.PM10, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              {selectedPollutants.includes('PM2.5') && (
                <Line
                  type="monotone"
                  dataKey="PM2.5"
                  stroke={POLLUTANT_COLORS['PM2.5']}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS['PM2.5'], strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              {selectedPollutants.includes('SO2') && (
                <Line
                  type="monotone"
                  dataKey="SO2"
                  stroke={POLLUTANT_COLORS.SO2}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS.SO2, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              {selectedPollutants.includes('CO') && (
                <Line
                  type="monotone"
                  dataKey="CO"
                  stroke={POLLUTANT_COLORS.CO}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS.CO, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              {selectedPollutants.includes('O3') && (
                <Line
                  type="monotone"
                  dataKey="O3"
                  stroke={POLLUTANT_COLORS.O3}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS.O3, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              {selectedPollutants.includes('NO2') && (
                <Line
                  type="monotone"
                  dataKey="NO2"
                  stroke={POLLUTANT_COLORS.NO2}
                  strokeWidth={2}
                  dot={{ fill: POLLUTANT_COLORS.NO2, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          * Data historis merupakan simulasi berdasarkan pembacaan terakhir
        </p>
      </CardContent>
    </Card>
  );
}
