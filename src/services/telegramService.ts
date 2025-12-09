import { supabase } from '@/integrations/supabase/client';
import { AirQualityCategory, PollutantData, DataSource } from '@/types/airQuality';

interface TelegramAlertPayload {
  category: AirQualityCategory;
  previousCategory?: AirQualityCategory;
  message: string;
  location?: string;
  source?: DataSource;
  pollutants?: {
    pm10?: number | null;
    pm25?: number | null;
    so2?: number | null;
    co?: number | null;
    o3?: number | null;
    no2?: number | null;
  };
}

/**
 * Send air quality alert via Telegram bot
 */
export async function sendTelegramAlert(
  category: AirQualityCategory,
  previousCategory: AirQualityCategory | null,
  location?: string,
  pollutants?: PollutantData,
  source?: DataSource
): Promise<boolean> {
  console.log('[Telegram Service] Sending alert:', { category, previousCategory, location, source });

  // Generate alert message
  const message = generateAlertMessage(category, previousCategory);

  const payload: TelegramAlertPayload = {
    category,
    message,
    location,
    source,
  };

  if (previousCategory) {
    payload.previousCategory = previousCategory;
  }

  if (pollutants) {
    payload.pollutants = {
      pm10: pollutants.pm_sepuluh,
      pm25: pollutants.pm_duakomalima,
      so2: pollutants.sulfur_dioksida,
      co: pollutants.karbon_monoksida,
      o3: pollutants.ozon,
      no2: pollutants.nitrogen_dioksida,
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-telegram-alert', {
      body: payload,
    });

    if (error) {
      console.error('[Telegram Service] Edge function error:', error);
      return false;
    }

    console.log('[Telegram Service] Alert sent successfully:', data);
    return true;
  } catch (error) {
    console.error('[Telegram Service] Failed to send alert:', error);
    return false;
  }
}

function generateAlertMessage(
  current: AirQualityCategory,
  previous: AirQualityCategory | null
): string {
  const levels = ['BAIK', 'SEDANG', 'TIDAK SEHAT', 'SANGAT TIDAK SEHAT', 'BERBAHAYA'];
  
  if (!previous) {
    return `Kualitas udara saat ini: ${current}`;
  }

  const prevIndex = levels.indexOf(previous);
  const currIndex = levels.indexOf(current);

  if (currIndex > prevIndex) {
    return `Kualitas udara menurun dari ${previous} menjadi ${current}. ${getHealthAdvice(current)}`;
  } else if (currIndex < prevIndex) {
    return `Kualitas udara membaik dari ${previous} menjadi ${current}.`;
  }

  return `Kualitas udara tetap: ${current}`;
}

function getHealthAdvice(category: AirQualityCategory): string {
  switch (category) {
    case 'TIDAK SEHAT':
      return 'Kelompok sensitif sebaiknya membatasi aktivitas di luar ruangan.';
    case 'SANGAT TIDAK SEHAT':
      return 'Semua orang sebaiknya mengurangi aktivitas di luar ruangan.';
    case 'BERBAHAYA':
      return 'PERINGATAN! Hindari aktivitas di luar ruangan dan gunakan masker jika harus keluar.';
    default:
      return '';
  }
}
