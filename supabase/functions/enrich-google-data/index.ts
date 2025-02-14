
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    console.log('Starting enrichment process...');
    const googlePlacesService = new GooglePlacesService(GOOGLE_PLACES_API_KEY);
    const contractorService = new ContractorService();

    // Test API connection
    await googlePlacesService.testApiConnection();
    console.log('API connection test successful');

    let allPlaces: PlaceSearchResult[] = [];
    let searchErrors = 0;

    // Search across all combinations
    for (const searchQuery of SEARCH_QUERIES) {
      for (const location of LOCATIONS) {
        try {
          console.log(`Searching for: "${searchQuery}" in "${location}"`);
          
          const places = await googlePlacesService.searchPlaces(searchQuery, location);
          console.log(`Found ${places.length} places for "${searchQuery}" in "${location}"`);
          
          // Filter out duplicates
          const newPlaces = places.filter(
            place => !allPlaces.some(existing => existing.id === place.id)
          );
          allPlaces = [...allPlaces, ...newPlaces];

          console.log(`Added ${newPlaces.length} new unique places from ${location}`);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Search error for ${searchQuery} in ${location}:`, error);
          searchErrors++;
        }
      }
    }

    console.log(`Total unique places found: ${allPlaces.length}`);

    if (allPlaces.length === 0) {
      return new Response(JSON.stringify({
        message: 'No places found in search response',
        searchQueries: SEARCH_QUERIES,
        locations: LOCATIONS,
        searchErrors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    // Process each place
    let processedCount = 0;
    let errorCount = 0;

    for (const place of allPlaces) {
      try {
        console.log(`Processing place: ${place.displayName?.text}`);
        
        const placeDetails = await googlePlacesService.getPlaceDetails(place.id);
        console.log('Got place details:', {
          name: placeDetails.displayName?.text,
          photoCount: placeDetails.photos?.length || 0
        });
        
        // Process photos - generate URLs for each photo
        let photos = [];
        if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
          photos = placeDetails.photos;
          console.log(`Processing ${photos.length} photos for ${placeDetails.displayName?.text}`);
        }

        // Determine the specialty based on the search query that found this place
        const specialty = getSpecialtyFromQuery(
          SEARCH_QUERIES.find(query => 
            placeDetails.types?.some(type => 
              type.toLowerCase().includes(query.toLowerCase())
            )
          ) || 'building company'
        );

        const contractorData: ContractorData = {
          business_name: placeDetails.displayName?.text || '',
          google_place_id: placeDetails.id,
          google_place_name: placeDetails.displayName?.text || '',
          google_formatted_address: placeDetails.formattedAddress || '',
          google_formatted_phone: placeDetails.internationalPhoneNumber || '',
          location: 'London',
          rating: placeDetails.rating,
          review_count: placeDetails.userRatingCount,
          specialty,
          google_reviews: placeDetails.reviews || [],
          google_photos: photos,
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

        console.log('Attempting to upsert contractor:', {
          name: contractorData.business_name,
          specialty: contractorData.specialty,
          photoCount: contractorData.google_photos?.length || 0
        });

        if (await contractorService.upsertContractor(contractorData)) {
          processedCount++;
          console.log(`Successfully processed: ${contractorData.business_name}`);
        } else {
          errorCount++;
          console.error(`Failed to process: ${contractorData.business_name}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error('Error processing place:', error);
      }
    }

    return new Response(JSON.stringify({
      message: 'Processing completed',
      totalFound: allPlaces.length,
      processed: processedCount,
      errors: errorCount,
      searchErrors
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
