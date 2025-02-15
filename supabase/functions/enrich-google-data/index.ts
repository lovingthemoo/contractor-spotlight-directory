import { corsHeaders } from '../_shared/cors.ts';
import { GooglePlacesService } from '../_shared/google-places-service.ts';
import { ContractorService } from '../_shared/contractor-service.ts';
import { PlaceSearchResult, ContractorData } from '../_shared/types.ts';

const SEARCH_QUERIES = {
  construction: [
    "roofing company",
    "roofer",
    "roofing contractor",
    "roof repair",
    "roofing specialist",
    "building company",
    "construction company",
    "building contractor",
    "construction specialist",
    "building specialist"
  ],
  maintenance: [
    "electrician london",
    "electrical contractor",
    "electrical services",
    "emergency electrician",
    "certified electrician",
    "plumber london",
    "plumbing contractor",
    "emergency plumber",
    "plumbing services",
    "gas engineer"
  ],
  outdoor: [
    "professional gardener",
    "landscape gardener",
    "garden maintenance",
    "landscaping services",
    "garden designer",
    "handyman services",
    "home repair service",
    "property maintenance",
    "home maintenance",
    "property repair"
  ]
};

const getSpecialtyFromQuery = (query: string): string => {
  const queryLower = query.toLowerCase();
  
  // Roofing specialists
  if (queryLower.includes('roof') || queryLower.includes('roofer')) {
    return 'Roofing';
  }
  
  // Plumbing specialists
  if (queryLower.includes('plumb') || queryLower.includes('gas engineer')) {
    return 'Plumbing';
  }
  
  // Electrical specialists
  if (queryLower.includes('electr')) {
    return 'Electrical';
  }
  
  // Gardening and landscaping
  if (queryLower.includes('garden') || 
      queryLower.includes('landscape') || 
      queryLower.includes('landscaping')) {
    return 'Gardening';
  }
  
  // Handyman and general repairs
  if (queryLower.includes('handyman') || 
      queryLower.includes('repair') || 
      queryLower.includes('maintenance')) {
    return 'Home Repairs';
  }
  
  // Construction and building
  if (queryLower.includes('construction')) {
    return 'Construction';
  }
  
  // Default to Building for general contractors
  return 'Building';
};

// Reduced scope for testing
const LOCATIONS = ["London"];
const MAX_PLACES_PER_RUN = 2;

Deno.serve(async (req) => {
  // Add CORS headers to all responses
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  };

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers });
    }

    // Early validation of API key
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    // Parse and validate request body
    if (req.method !== 'POST') {
      throw new Error(`Invalid method: ${req.method}. Only POST requests are allowed.`);
    }

    const text = await req.text();
    if (!text) {
      throw new Error('Request body is empty');
    }

    console.log('Request body:', text);
    
    const body = JSON.parse(text);
    const { category } = body;

    if (!category || !SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES]) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Initialize services
    const googlePlacesService = new GooglePlacesService(GOOGLE_PLACES_API_KEY);
    const contractorService = new ContractorService();

    // Test API connection
    await googlePlacesService.testApiConnection();

    // Get first query for the category
    const searchQuery = SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES][0];
    let allPlaces: PlaceSearchResult[] = [];

    // Search in single location
    const places = await googlePlacesService.searchPlaces(searchQuery, LOCATIONS[0]);
    allPlaces = places.slice(0, MAX_PLACES_PER_RUN);

    console.log(`Found ${allPlaces.length} places to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process places
    for (const place of allPlaces) {
      try {
        console.log(`Processing place: ${place.id}`);
        const placeDetails = await googlePlacesService.getPlaceDetails(place.id);
        
        const contractorData: ContractorData = {
          business_name: placeDetails.displayName?.text || '',
          google_place_id: placeDetails.id,
          google_place_name: placeDetails.displayName?.text || '',
          google_formatted_address: placeDetails.formattedAddress || '',
          google_formatted_phone: placeDetails.internationalPhoneNumber || '',
          location: 'London',
          rating: placeDetails.rating || null,
          review_count: placeDetails.userRatingCount || 0,
          specialty: getSpecialtyFromQuery(searchQuery),
          google_reviews: placeDetails.reviews || [],
          google_photos: placeDetails.photos || [],
          website_url: placeDetails.websiteUri || null,
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

        const success = await contractorService.upsertContractor(contractorData);
        if (success) {
          processedCount++;
          console.log(`Successfully processed ${processedCount}/${allPlaces.length}`);
        }

        // Rate limiting between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error processing place:', error);
        errorCount++;
      }
    }

    // Send success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processing completed for ${category}`,
        totalFound: allPlaces.length,
        processed: processedCount,
        errors: errorCount,
        category
      }), 
      { headers }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
      }), 
      { 
        headers,
        status: 500
      }
    );
  }
});
