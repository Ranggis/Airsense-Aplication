import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hugging Face Space URL - hardcoded as per user specification
const HF_SPACE_URL = "https://ranggis-air-quality.hf.space";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { features } = await req.json();

    // Validate features array - must have exactly 7 features
    // Order: [PM10, PM2.5, SO2, CO, O3, NO2, MAX]
    if (!features || !Array.isArray(features) || features.length !== 7) {
      console.error('[predict-air-quality] Invalid features. Expected 7, got:', features?.length);
      return new Response(
        JSON.stringify({ 
          error: 'Features must be an array of 7 values: [PM10, PM2.5, SO2, CO, O3, NO2, MAX]',
          useFallback: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[predict-air-quality] Calling HF Space with 7 features:', features);

    // Call Hugging Face Space API with exact format required
    const response = await fetch(`${HF_SPACE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[predict-air-quality] HF Space error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `HF Space returned ${response.status}: ${errorText}`,
          useFallback: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    console.log('[predict-air-quality] HF Space response:', data);

    // Return the prediction result
    return new Response(
      JSON.stringify({
        category: data.category || data.prediction,
        confidence: data.confidence || data.probability || 0.95,
        useFallback: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[predict-air-quality] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        useFallback: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
