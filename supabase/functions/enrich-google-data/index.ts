
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

    // Log first few characters of API key to verify it's loaded (never log full key)
    console.log('API Key starts with:', GOOGLE_PLACES_API_KEY.substring(0, 4) + '...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // More generic search terms
    const searchQueries = [
      "builders",
      "construction",
      "building company"
    ];

    let allPlaces: PlaceSearchResult[] = [];

    // Try each search query
    for (const searchQuery of searchQueries) {
      console.log('Searching for:', searchQuery);
      
      const findPlaceUrl = `https://places.googleapis.com/v1/places:searchText`;
      
      const searchBody = {
        textQuery: `${searchQuery} in London`,
        maxResultCount: 20,
        languageCode: "en-GB",
        locationBias: {
          circle: {
            center: {
              latitude: 51.5074,
              longitude: -0.1278
            },
            radius: 20000.0
          }
        }
      };
      
      console.log('Search request body:', JSON.stringify(searchBody));

      try {
        const searchResponse = await fetch(findPlaceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types'
          },
          body: JSON.stringify(searchBody)
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('Search API error:', {
            status: searchResponse.status,
            statusText: searchResponse.statusText,
            body: errorText
          });
          continue;
        }

        const searchData = await searchResponse.json();
        console.log('Search response:', {
          query: searchQuery,
          totalPlaces: searchData.places?.length || 0
        });

        if (searchData.places && Array.isArray(searchData.places)) {
          // Include all places, we'll filter by rating later
          allPlaces = [...allPlaces, ...searchData.places];
        }
      } catch (searchError) {
        console.error('Error during search:', searchError);
        continue;
      }
    }

    console.log(`Total places found: ${allPlaces.length}`);

    // Now filter for rating, but with a lower threshold initially
    const highRatedPlaces = allPlaces.filter((place: PlaceSearchResult) => 
      place.rating && place.rating >= 3.5  // Lowered threshold from 4.0
    );

    console.log(`High-rated places (>=3.5 stars): ${highRatedPlaces.length}`);

    if (highRatedPlaces.length === 0) {
      // If no places found, log all places for debugging
      console.log('All places found:', allPlaces);
      throw new Error('No high-rated places found. Total places found: ' + allPlaces.length);
    }

    // Process each high-rated place
    let successfullyProcessed = 0;
    for (const place of highRatedPlaces) {
      try {
        console.log('Processing place:', place.displayName.text);
        
        // Get detailed place information
        const placeUrl = `https://places.googleapis.com/v1/places/${place.id}`;
        const placeResponse = await fetch(placeUrl, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,businessStatus,reviews,photos,primaryType,types,rating,userRatingCount,websiteUri,phoneNumbers,openingHours'
          }
        });

        if (!placeResponse.ok) {
          console.error('Error fetching place details:', {
            placeId: place.id,
            status: placeResponse.status,
            statusText: placeResponse.statusText
          });
          continue;
        }

        const placeDetails = await placeResponse.json();
        
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
          slug: placeDetails.displayName?.text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + 
            '-' + placeDetails.id.substring(0, 6)
        };

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

        successfullyProcessed++;
        console.log(`Successfully processed: ${contractorData.business_name}`);

      } catch (placeError) {
        console.error('Error processing place:', {
          placeId: place.id,
          error: placeError
        });
      }
    }

    return new Response(JSON.stringify({
      message: 'Processing completed',
      totalPlaces: allPlaces.length,
      highRatedPlaces: highRatedPlaces.length,
      successfullyProcessed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
