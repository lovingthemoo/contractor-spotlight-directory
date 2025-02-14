
import { corsHeaders } from '../_shared/cors.ts';
import { GooglePlacesService } from '../_shared/google-places-service.ts';
import { ContractorService } from '../_shared/contractor-service.ts';
import { PlaceSearchResult, ContractorData } from '../_shared/types.ts';

const SEARCH_QUERIES = {
  construction: [
    "building company",
    "construction company",
    "building contractor",
    "roofer",
    "roofing contractor",
    "roof repair"
  ],
  maintenance: [
    "electrician",
    "electrical contractor",
    "plumber",
    "plumbing contractor",
    "emergency plumber"
  ],
  outdoor: [
    "gardener",
    "landscape gardener",
    "garden maintenance",
    "handyman",
    "home repair service",
    "property maintenance"
  ]
};

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    // Parse the request body to get the category
    const { category } = await req.json();
    if (!category || !SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES]) {
      throw new Error('Invalid category specified');
    }

    const queries = SEARCH_QUERIES[category as keyof typeof SEARCH_QUERIES];
    console.log(`Starting enrichment for category: ${category}`);

    const googlePlacesService = new GooglePlacesService(GOOGLE_PLACES_API_KEY);
    const contractorService = new ContractorService();

    // Test API connection
    await googlePlacesService.testApiConnection();
    console.log('API connection test successful');

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

    return new Response(JSON.stringify({
      message: `Processing completed for ${category}`,
      totalFound: allPlaces.length,
      processed: processedCount,
      errors: errorCount,
      searchErrors,
      category
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
