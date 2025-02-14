
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ContractorToEnrich {
  id: string;
  business_name: string;
  location: string;
  last_enrichment_attempt?: string;
  google_place_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get contractors that need enrichment and haven't been updated in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: contractors, error: fetchError } = await supabaseClient
      .from('contractors')
      .select('id, business_name, location, last_enrichment_attempt, google_place_id')
      .or('last_enrichment_attempt.is.null,last_enrichment_attempt.lt.' + thirtyDaysAgo.toISOString())
      .eq('needs_google_enrichment', true)
      .limit(10); // Process in batches

    if (fetchError) {
      throw fetchError;
    }

    if (!contractors || contractors.length === 0) {
      return new Response(JSON.stringify({ message: 'No contractors need enrichment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    for (const contractor of contractors) {
      console.log(`Processing contractor: ${contractor.business_name}`);
      
      try {
        // Step 1: Find Place ID if we don't have it
        if (!contractor.google_place_id) {
          const searchQuery = `${contractor.business_name} ${contractor.location}`;
          const findPlaceUrl = `https://places.googleapis.com/v1/places:searchText`;
          
          const findPlaceResponse = await fetch(findPlaceUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
            },
            body: JSON.stringify({
              textQuery: searchQuery,
              languageCode: "en"
            })
          });

          const placeData = await findPlaceResponse.json();
          
          if (placeData.places && placeData.places[0]) {
            contractor.google_place_id = placeData.places[0].id;
          }
        }

        // Step 2: Get Place Details if we have a Place ID
        if (contractor.google_place_id) {
          const placeUrl = `https://places.googleapis.com/v1/places/${contractor.google_place_id}`;
          
          const placeResponse = await fetch(placeUrl, {
            headers: {
              'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
              'X-Goog-FieldMask': 'id,displayName,formattedAddress,businessStatus,reviews,photos,primaryType,types,rating,userRatingCount'
            }
          });

          const placeDetails = await placeResponse.json();

          // Update contractor with Google data
          const { error: updateError } = await supabaseClient
            .from('contractors')
            .update({
              google_place_name: placeDetails.displayName?.text,
              google_formatted_address: placeDetails.formattedAddress,
              google_business_scopes: placeDetails.types,
              rating: placeDetails.rating,
              review_count: placeDetails.userRatingCount,
              google_reviews: placeDetails.reviews,
              google_photos: placeDetails.photos,
              needs_google_enrichment: false,
              last_enrichment_attempt: new Date().toISOString()
            })
            .eq('id', contractor.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`Successfully enriched data for: ${contractor.business_name}`);
        }
      } catch (error) {
        console.error(`Error processing contractor ${contractor.business_name}:`, error);
        
        // Update last attempt even if there was an error
        await supabaseClient
          .from('contractors')
          .update({
            last_enrichment_attempt: new Date().toISOString()
          })
          .eq('id', contractor.id);
      }
    }

    return new Response(JSON.stringify({ message: 'Enrichment process completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
