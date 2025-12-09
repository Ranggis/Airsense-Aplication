-- Create table for historical air quality readings
CREATE TABLE public.air_quality_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_source TEXT NOT NULL CHECK (data_source IN ('firebase', 'openweathermap', 'openaq')),
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Pollutant values
  pm10 DOUBLE PRECISION,
  pm25 DOUBLE PRECISION,
  so2 DOUBLE PRECISION,
  co DOUBLE PRECISION,
  o3 DOUBLE PRECISION,
  no2 DOUBLE PRECISION,
  
  -- Prediction result
  category TEXT NOT NULL CHECK (category IN ('BAIK', 'SEDANG', 'TIDAK SEHAT', 'SANGAT TIDAK SEHAT', 'BERBAHAYA')),
  confidence DOUBLE PRECISION,
  
  -- Weather data (optional)
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  pressure DOUBLE PRECISION
);

-- Enable Row Level Security
ALTER TABLE public.air_quality_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read data (for research purposes)
CREATE POLICY "Anyone can read air quality readings"
ON public.air_quality_readings
FOR SELECT
USING (true);

-- Allow anyone to insert data (since no auth is implemented)
CREATE POLICY "Anyone can insert air quality readings"
ON public.air_quality_readings
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries by date and source
CREATE INDEX idx_air_quality_readings_created_at ON public.air_quality_readings(created_at DESC);
CREATE INDEX idx_air_quality_readings_source ON public.air_quality_readings(data_source);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.air_quality_readings;