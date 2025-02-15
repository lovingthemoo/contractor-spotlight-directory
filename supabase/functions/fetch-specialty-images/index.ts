
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { searchTerms } from './types.ts';
import { searchPlaces, downloadPhoto } from './google-places.ts';
import { setupStorage, storeImage, storeImageMetadata } from './storage.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specialty } = await req.json();
    
    if (!specialty) {
      throw new Error('Specialty is required');
    }

    console.log('Processing request for specialty:', specialty);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await setupStorage(supabase);

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const terms = searchTerms[specialty] || [`${specialty.toLowerCase()} contractor UK`];
    let processedCount = 0;

    for (const term of terms) {
      const places = await searchPlaces(term, GOOGLE_API_KEY);
      
      for (const place of places) {
        if (!place.photos) continue;

        for (const photo of place.photos) {
          const imageBlob = await downloadPhoto(photo, GOOGLE_API_KEY);
          if (!imageBlob) continue;

          const publicUrl = await storeImage(supabase, specialty, place, imageBlob);
          if (!publicUrl) continue;

          if (await storeImageMetadata(supabase, specialty, place, publicUrl)) {
            processedCount++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processedCount,
        message: `Processed images for ${specialty}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in fetch-specialty-images:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
