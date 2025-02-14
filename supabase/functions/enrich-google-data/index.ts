import { corsHeaders } from '../_shared/cors.ts';
import { GooglePlacesService } from '../_shared/google-places-service.ts';
import { ContractorService } from '../_shared/contractor-service.ts';
import { PlaceSearchResult, ContractorData } from '../_shared/types.ts';

const SEARCH_QUERIES = [
  // Building and Construction
  "building company",
  "construction company",
  "building contractor",
  // Electricians
  "electrician",
  "electrical contractor",
  // Gardeners
  "gardener",
  "landscape gardener",
  "garden maintenance",
  // Home Repairs
  "handyman",
  "home repair service",
  "property maintenance",
  // Plumbers
  "plumber",
  "plumbing contractor",
  "emergency plumber",
  // Roofers
  "roofer",
  "roofing contractor",
  "roof repair"
];

const LOCATIONS = [
  "London",
  "Greater London",
  "North London",
  "South London",
  "East London",
  "West London"
];

const getSpecialtyFromQuery = (query: string): string => {
  const queryLower = query.toLowerCase();
  if (queryLower.includes('plumb')) return 'Plumbing';
  if (queryLower.includes('electr')) return 'Electrical';
  if (queryLower.includes('garden') || queryLower.includes('landscape')) return 'Gardening';
  if (queryLower.includes('roof')) return 'Roofing';
  if (queryLower.includes('handyman') || queryLower.includes('repair')) return 'Home Repairs';
  return 'Building';
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Starting function execution');

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('Missing GOOGLE_PLACES_API_KEY');
      throw new Error('Google Places API key not configured');
    }

    console.log('Initializing services...');
    const googlePlacesService = new GooglePlacesService(GOOGLE_PLACES_API_KEY);
    const contractorService = new ContractorService();

    // Test API connection with better error handling
    try {
      console.log('Testing API connection...');
      await googlePlacesService.testApiConnection();
      console.log('API connection test successful');
    } catch (error) {
      console.error('API connection test failed:', error);
      throw new Error(`Failed to connect to Google Places API: ${error.message}`);
    }

    let allPlaces: PlaceSearchResult[] = [];
    let searchErrors = 0;

    // Start with a single test query first
    const testQuery = SEARCH_QUERIES[0];
    const testLocation = LOCATIONS[0];
    
    try {
      console.log(`Testing search with: "${testQuery}" in "${testLocation}"`);
      const places = await googlePlacesService.searchPlaces(testQuery, testLocation);
      console.log(`Test search found ${places.length} places`);
      allPlaces = places;
    } catch (error) {
      console.error('Test search failed:', error);
      throw new Error(`Failed to perform test search: ${error.message}`);
    }

    // Process test results
    let processedCount = 0;
    let errorCount = 0;

    if (allPlaces.length > 0) {
      const testPlace = allPlaces[0];
      try {
        console.log(`Testing place details fetch for: ${testPlace.displayName?.text}`);
        const placeDetails = await googlePlacesService.getPlaceDetails(testPlace.id);
        
        const contractorData: ContractorData = {
          business_name: placeDetails.displayName?.text || '',
          google_place_id: placeDetails.id,
          google_place_name: placeDetails.displayName?.text || '',
          google_formatted_address: placeDetails.formattedAddress || '',
          google_formatted_phone: placeDetails.internationalPhoneNumber || '',
          location: 'London',
          rating: placeDetails.rating,
          review_count: placeDetails.userRatingCount,
          specialty: getSpecialtyFromQuery(testQuery),
          google_reviews: placeDetails.reviews || [],
          google_photos: placeDetails.photos || [],
          website_url: placeDetails.websiteUri,
          google_business_scopes: placeDetails.types || [],
          needs_google_enrichment: false,
          last_enrichment_attempt: new Date().toISOString(),
          description: placeDetails.editorialSummary?.text || '',
          website_description: placeDetails.editorialSummary?.text || '',
          slug: (placeDetails.displayName?.text || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + 
            '-' + placeDetails.id.substring(0, 6)
        };

        console.log('Testing contractor upsert...');
        if (await contractorService.upsertContractor(contractorData)) {
          processedCount++;
          console.log('Test upsert successful');
        }
      } catch (error) {
        errorCount++;
        console.error('Test processing failed:', error);
        throw new Error(`Failed to process test place: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      message: 'Test processing completed',
      totalFound: allPlaces.length,
      processed: processedCount,
      errors: errorCount,
      searchErrors
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
      context: 'Function execution failed'
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
