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

const LOCATIONS = [
  "London",
  "Greater London",
  "North London",
  "South London",
  "East London",
  "West London"
];

Deno.serve(async (req) => {
  // Always add CORS headers
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers,
      status: 200
    });
  }

  try {
    // Log incoming request details
    console.log('Incoming request:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Validate API key first
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('Missing Google Places API key');
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }), 
        { status: 500, headers }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      body = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: e.message 
        }), 
        { status: 400, headers }
      );
    }

    // Validate category
    const { category } = body;
    if (!category || !SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES]) {
      console.error('Invalid category:', category);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid category specified',
          provided: category,
          allowed: Object.keys(SEARCH_QUERIES)
        }), 
        { status: 400, headers }
      );
    }

    console.log(`Starting enrichment for category: ${category}`);
    const queries = SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES];

    const googlePlacesService = new GooglePlacesService(GOOGLE_PLACES_API_KEY);
    const contractorService = new ContractorService();

    // Test API connection with error handling
    try {
      await googlePlacesService.testApiConnection();
      console.log('API connection test successful');
    } catch (error) {
      console.error('API connection test failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to connect to Google Places API',
          details: error.message
        }), 
        { status: 500, headers }
      );
    }

    let allPlaces: PlaceSearchResult[] = [];
    let searchErrors = 0;

    // Search across selected category queries
    for (const searchQuery of queries) {
      for (const location of LOCATIONS) {
        try {
          console.log(`Searching for: "${searchQuery}" in "${location}"`);
          const places = await googlePlacesService.searchPlaces(searchQuery, location);
          
          // Filter out duplicates
          const newPlaces = places.filter(
            place => !allPlaces.some(existing => existing.id === place.id)
          );
          allPlaces = [...allPlaces, ...newPlaces];
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Search error for ${searchQuery} in ${location}:`, error);
          searchErrors++;
        }
      }
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const place of allPlaces) {
      try {
        const placeDetails = await googlePlacesService.getPlaceDetails(place.id);
        
        const contractorData: ContractorData = {
          business_name: placeDetails.displayName?.text || '',
          google_place_id: placeDetails.id,
          google_place_name: placeDetails.displayName?.text || '',
          google_formatted_address: placeDetails.formattedAddress || '',
          google_formatted_phone: placeDetails.internationalPhoneNumber || '',
          location: 'London',
          rating: placeDetails.rating,
          review_count: placeDetails.userRatingCount,
          specialty: getSpecialtyFromQuery(queries.find(q => 
            placeDetails.types?.some(type => 
              type.toLowerCase().includes(q.toLowerCase())
            )
          ) || queries[0]),
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

        if (await contractorService.upsertContractor(contractorData)) {
          processedCount++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error('Error processing place:', error);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processing completed for ${category}`,
        totalFound: allPlaces.length,
        processed: processedCount,
        errors: errorCount,
        searchErrors,
        category
      }), 
      { headers }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        type: error.name
      }), 
      { headers, status: 500 }
    );
  }
});
