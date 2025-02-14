
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

interface PlaceSearchResult {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Search for builders in London
    const searchQuery = "builders in London";
    const findPlaceUrl = `https://places.googleapis.com/v1/places:searchText`;
    
    console.log('Initiating search for:', searchQuery);
    
    const searchResponse = await fetch(findPlaceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types'
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: 20, // Adjust as needed
        languageCode: "en-GB",
        regionCode: "GB"
      })
    });

    const searchData = await searchResponse.json();
    console.log('Search response:', searchData);

    if (!searchData.places || !Array.isArray(searchData.places)) {
      throw new Error('No places found in search response');
    }

    // Filter for places with rating >= 4.0
    const highRatedPlaces = searchData.places.filter((place: PlaceSearchResult) => 
      place.rating && place.rating >= 4.0
    );

    console.log(`Found ${highRatedPlaces.length} high-rated places`);

    // Process each high-rated place
    for (const place of highRatedPlaces) {
      try {
        // Get detailed place information
        const placeUrl = `https://places.googleapis.com/v1/places/${place.id}`;
        const placeResponse = await fetch(placeUrl, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,businessStatus,reviews,photos,primaryType,types,rating,userRatingCount,websiteUri,phoneNumbers,openingHours'
          }
        });

        const placeDetails = await placeResponse.json();
        console.log('Place details:', placeDetails);

        // Prepare contractor data
        const contractorData = {
          business_name: placeDetails.displayName?.text,
          google_place_id: placeDetails.id,
          google_place_name: placeDetails.displayName?.text,
          google_formatted_address: placeDetails.formattedAddress,
          google_formatted_phone: placeDetails.phoneNumbers?.[0],
          location: 'London',
          rating: placeDetails.rating,
          review_count: placeDetails.userRatingCount,
          specialty: 'Building',
          google_reviews: placeDetails.reviews,
          google_photos: placeDetails.photos,
          website_url: placeDetails.websiteUri,
          opening_hours: placeDetails.openingHours,
          google_business_scopes: placeDetails.types,
          needs_google_enrichment: false,
          last_enrichment_attempt: new Date().toISOString(),
          // Generate a URL-friendly slug from the business name
          slug: placeDetails.displayName?.text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + 
            '-' + placeDetails.id.substring(0, 6)
        };

        // Insert or update contractor in database
        const { error: upsertError } = await supabase
          .from('contractors')
          .upsert(contractorData, {
            onConflict: 'google_place_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error('Error upserting contractor:', upsertError);
          continue;
        }

        console.log(`Successfully processed: ${contractorData.business_name}`);

      } catch (placeError) {
        console.error('Error processing place:', place.id, placeError);
      }
    }

    return new Response(JSON.stringify({
      message: 'Processing completed',
      processed: highRatedPlaces.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
