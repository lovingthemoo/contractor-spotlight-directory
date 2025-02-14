
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

    // Test mode: Only get NG Builders Limited
    const { data: contractors, error: fetchError } = await supabaseClient
      .from('contractors')
      .select('id, business_name, location, last_enrichment_attempt, google_place_id')
      .eq('business_name', 'NG Builders Limited')
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (!contractors || contractors.length === 0) {
      return new Response(JSON.stringify({ message: 'Contractor not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const contractor = contractors[0];
    console.log(`Processing contractor: ${contractor.business_name}`);
    
    try {
      // Step 1: Find Place ID if we don't have it
      if (!contractor.google_place_id) {
        const searchQuery = `${contractor.business_name} ${contractor.location}`;
        const findPlaceUrl = `https://places.googleapis.com/v1/places:searchText`;
        
        console.log('Searching for place with query:', searchQuery);
        
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
        console.log('Place search response:', placeData);
        
        if (placeData.places && placeData.places[0]) {
          contractor.google_place_id = placeData.places[0].id;
          console.log('Found place ID:', contractor.google_place_id);
        }
      }

      // Step 2: Get Place Details if we have a Place ID
      if (contractor.google_place_id) {
        const placeUrl = `https://places.googleapis.com/v1/places/${contractor.google_place_id}`;
        
        console.log('Fetching place details for ID:', contractor.google_place_id);
        
        const placeResponse = await fetch(placeUrl, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,businessStatus,reviews,photos,primaryType,types,rating,userRatingCount'
          }
        });

        const placeDetails = await placeResponse.json();
        console.log('Place details response:', placeDetails);

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
        return new Response(JSON.stringify({ 
          message: 'Enrichment successful',
          details: {
            business_name: contractor.business_name,
            google_place_name: placeDetails.displayName?.text,
            google_formatted_address: placeDetails.formattedAddress,
            rating: placeDetails.rating,
            review_count: placeDetails.userRatingCount
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else {
        console.log('No place ID found for contractor');
        return new Response(JSON.stringify({ 
          message: 'No Google Places match found',
          details: {
            business_name: contractor.business_name,
            location: contractor.location
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
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

      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
