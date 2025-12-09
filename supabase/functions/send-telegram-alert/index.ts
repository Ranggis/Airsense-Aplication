import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramAlertRequest {
  category: string;
  previousCategory?: string;
  message: string;
  location?: string;
  source?: 'iot' | 'openweathermap' | 'openaq';
  pollutants?: {
    pm10?: number;
    pm25?: number;
    so2?: number;
    co?: number;
    o3?: number;
    no2?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('[Telegram Alert] Received request');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('[Telegram Alert] Missing bot token or chat ID');
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { category, previousCategory, location, source, pollutants }: TelegramAlertRequest = await req.json();
    console.log('[Telegram Alert] Sending alert for category:', category, 'source:', source);

    const categoryEmoji = getCategoryEmoji(category);
    const trendInfo = getTrendInfo(previousCategory, category);
    const sourceName = getSourceName(source);
    const sourceEmoji = getSourceEmoji(source);
    const timestamp = new Date().toLocaleString('id-ID', { 
      dateStyle: 'long', 
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta'
    });

    let msg = ``;
    msg += `${categoryEmoji} *AIRSENSE ALERT*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    msg += `${trendInfo.emoji} *${trendInfo.title}*\n\n`;
    
    msg += `🏷 *Status:* \`${category}\`\n`;
    if (location) {
      msg += `📍 *Lokasi:* ${location}\n`;
    }
    msg += `${sourceEmoji} *Sumber:* ${sourceName}\n`;
    msg += `🕐 *Waktu:* ${timestamp} WIB\n\n`;

    if (pollutants && Object.keys(pollutants).length > 0) {
      msg += `📊 *Data Polutan*\n`;
      msg += `\`\`\`\n`;
      if (pollutants.pm10 != null) msg += `PM10   : ${pollutants.pm10.toFixed(1)} µg/m³\n`;
      if (pollutants.pm25 != null) msg += `PM2.5  : ${pollutants.pm25.toFixed(1)} µg/m³\n`;
      if (pollutants.so2 != null) msg += `SO₂    : ${pollutants.so2.toFixed(1)} µg/m³\n`;
      if (pollutants.co != null) msg += `CO     : ${pollutants.co.toFixed(1)} mg/m³\n`;
      if (pollutants.o3 != null) msg += `O₃     : ${pollutants.o3.toFixed(1)} µg/m³\n`;
      if (pollutants.no2 != null) msg += `NO₂    : ${pollutants.no2.toFixed(1)} µg/m³\n`;
      msg += `\`\`\`\n\n`;
    }

    const advice = getHealthAdvice(category);
    if (advice) {
      msg += `💡 *Saran:* ${advice}\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Powered by AirSense_ 🌐`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log('[Telegram Alert] Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Telegram Alert] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'BAIK': return '🟢';
    case 'SEDANG': return '🟡';
    case 'TIDAK SEHAT': return '🟠';
    case 'SANGAT TIDAK SEHAT': return '🔴';
    case 'BERBAHAYA': return '☠️';
    default: return '⚪';
  }
}

function getTrendInfo(previous?: string, current?: string): { emoji: string; title: string } {
  const levels = ['BAIK', 'SEDANG', 'TIDAK SEHAT', 'SANGAT TIDAK SEHAT', 'BERBAHAYA'];
  if (!previous || !current) {
    return { emoji: '📢', title: 'Update Kualitas Udara' };
  }
  
  const prevIndex = levels.indexOf(previous);
  const currIndex = levels.indexOf(current);
  
  if (currIndex > prevIndex) {
    return { emoji: '⚠️', title: 'Kualitas Udara Menurun!' };
  }
  if (currIndex < prevIndex) {
    return { emoji: '✅', title: 'Kualitas Udara Membaik!' };
  }
  return { emoji: '📢', title: 'Update Kualitas Udara' };
}

function getSourceName(source?: string): string {
  switch (source) {
    case 'iot': return 'IoT Sensor';
    case 'openweathermap': return 'OpenWeatherMap';
    case 'openaq': return 'OpenAQ';
    default: return 'Unknown';
  }
}

function getSourceEmoji(source?: string): string {
  switch (source) {
    case 'iot': return '📡';
    case 'openweathermap': return '🌤️';
    case 'openaq': return '🌍';
    default: return '📊';
  }
}

function getHealthAdvice(category: string): string {
  switch (category) {
    case 'BAIK':
      return 'Kondisi udara sangat baik untuk aktivitas luar ruangan.';
    case 'SEDANG':
      return 'Kelompok sensitif sebaiknya membatasi aktivitas berat di luar.';
    case 'TIDAK SEHAT':
      return 'Kurangi aktivitas luar ruangan, gunakan masker jika perlu.';
    case 'SANGAT TIDAK SEHAT':
      return 'Hindari aktivitas luar, tutup jendela, gunakan air purifier.';
    case 'BERBAHAYA':
      return 'DARURAT! Tetap di dalam ruangan, gunakan masker N95 jika keluar.';
    default:
      return '';
  }
}

serve(handler);
