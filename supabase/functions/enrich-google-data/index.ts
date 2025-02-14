
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

    // Validate API key format (basic check)
    if (!GOOGLE_PLACES_API_KEY.startsWith('AIza')) {
      throw new Error('Invalid Google Places API key format');
    }

    console.log('Using Google Places API key starting with:', GOOGLE_PLACES_API_KEY.substring(0, 6) + '...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try a single, simple search first to validate API connectivity
    const testSearchBody = {
      textQuery: "builders in London",
      maxResultCount: 5,
      languageCode: "en"
    };

    console.log('Testing API with simple search:', testSearchBody);

    const testResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify(testSearchBody)
    });

    const testData = await testResponse.text();
    console.log('Test API response status:', testResponse.status);
    console.log('Test API response:', testData);

    if (!testResponse.ok) {
      throw new Error(`Google Places API test failed: ${testResponse.status} ${testData}`);
    }

    // If test passed, proceed with full search
    const searchQueries = [
      "builders",
      "building contractor",
      "construction company"
    ];

    let allPlaces: PlaceSearchResult[] = [];

    for (const searchQuery of searchQueries) {
      console.log(`Searching for: "${searchQuery}"`);
      
      const searchBody = {
        textQuery: `${searchQuery} in London`,
        maxResultCount: 20,
        languageCode: "en",
        includedType: "builder"
      };

      const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
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
        console.error('Search failed:', {
          query: searchQuery,
          status: searchResponse.status,
          error: errorText
        });
        continue;
      }

      const searchData = await searchResponse.json();
      
      console.log('Search results:', {
        query: searchQuery,
        responseKeys: Object.keys(searchData),
        placesFound: searchData.places?.length || 0
      });

      if (searchData.places && Array.isArray(searchData.places)) {
        allPlaces = [...allPlaces, ...searchData.places];
      }
    }

    console.log(`Total places found before filtering: ${allPlaces.length}`);

    // Accept all places initially, we can filter by rating later
    if (allPlaces.length === 0) {
      console.log('Places API is working but returned no results');
      return new Response(JSON.stringify({
        message: 'No places found in search response',
        searchQueries
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    // Process each place
    let processedCount = 0;
    for (const place of allPlaces) {
      try {
        console.log(`Processing place: ${place.displayName?.text}`);
        
        const placeUrl = `https://places.googleapis.com/v1/places/${place.id}`;
        const placeResponse = await fetch(placeUrl, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,businessStatus,reviews,photos,primaryType,types,rating,userRatingCount,websiteUri,phoneNumbers,openingHours'
          }
        });

        if (!placeResponse.ok) {
          console.error(`Failed to fetch details for place ${place.id}:`, await placeResponse.text());
          continue;
        }

        const placeDetails = await placeResponse.json();
        
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
          console.error('Failed to upsert contractor:', upsertError);
          continue;
        }

        processedCount++;
        console.log(`Successfully processed: ${contractorData.business_name}`);
      } catch (error) {
        console.error('Error processing place:', error);
      }
    }

    return new Response(JSON.stringify({
      message: 'Processing completed',
      totalFound: allPlaces.length,
      processed: processedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
