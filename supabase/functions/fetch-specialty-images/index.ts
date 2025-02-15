
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions: string[];
}

interface PlaceDetails {
  place_id: string;
  photos?: PlacePhoto[];
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { specialty } = await req.json()
    
    if (!specialty) {
      throw new Error('Specialty is required')
    }

    console.log('Processing request for specialty:', specialty);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the storage bucket exists, create if it doesn't
    const { data: buckets } = await supabase
      .storage
      .listBuckets();

    if (!buckets?.find(b => b.name === 'contractor-images')) {
      console.log('Creating contractor-images bucket');
      const { error: bucketError } = await supabase
        .storage
        .createBucket('contractor-images', { public: true });
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        throw bucketError;
      }
    }

    // Search terms for each specialty
    const searchTerms: Record<string, string[]> = {
      'Electrical': ['electrician business UK', 'electrical contractor UK', 'electrical works UK'],
      'Plumbing': ['plumber business UK', 'plumbing contractor UK', 'plumbing works UK'],
      'Roofing': ['roofing contractor UK', 'roof repair UK', 'roofing company UK'],
      'Building': ['building contractor UK', 'construction company UK', 'builder UK'],
      'Home Repair': ['home repair contractor UK', 'property maintenance UK', 'home improvement UK'],
      'Gardening': ['gardening service UK', 'landscape contractor UK', 'garden maintenance UK'],
      'Construction': ['construction site UK', 'building construction UK', 'construction company UK'],
      'Handyman': ['handyman service UK', 'property maintenance UK', 'home repair UK']
    }

    const terms = searchTerms[specialty] || [`${specialty.toLowerCase()} contractor UK`]
    const places: PlaceDetails[] = []
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    console.log('Starting place search for terms:', terms);

    // Search for places
    for (const term of terms) {
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(term)}&key=${GOOGLE_API_KEY}`
      )
      
      if (!searchResponse.ok) {
        console.error(`Failed to search places for term: ${term}`, await searchResponse.text());
        continue;
      }

      const searchData = await searchResponse.json()
      console.log(`Found ${searchData.results?.length || 0} results for term: ${term}`);
      
      // Get details for each place that has photos
      for (const place of searchData.results) {
        if (places.length >= 50) break;

        if (place.photos && place.photos.length > 0) {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos&key=${GOOGLE_API_KEY}`
          )

          if (!detailsResponse.ok) {
            console.error(`Failed to get details for place: ${place.place_id}`, await detailsResponse.text());
            continue;
          }

          const detailsData = await detailsResponse.json()
          if (detailsData.result && detailsData.result.photos) {
            places.push({
              place_id: place.place_id,
              name: place.name,
              photos: detailsData.result.photos
            })
          }
        }
      }
    }

    console.log(`Found ${places.length} places with photos for ${specialty}`);

    // Store photos for each place
    for (const place of places) {
      if (!place.photos) continue;

      for (const photo of place.photos) {
        try {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
          
          // Download the photo
          const imageResponse = await fetch(photoUrl)
          if (!imageResponse.ok) {
            console.error(`Failed to fetch photo for place: ${place.place_id}`, await imageResponse.text());
            continue;
          }

          const imageBlob = await imageResponse.blob()
          const fileName = `specialty/${specialty.toLowerCase()}/${place.place_id}-${crypto.randomUUID()}.jpg`

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('contractor-images')
            .upload(fileName, imageBlob, {
              contentType: 'image/jpeg',
              upsert: true
            })

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('contractor-images')
            .getPublicUrl(fileName)

          // Store in specialty_default_images
          const { error: insertError } = await supabase
            .from('specialty_default_images')
            .insert({
              specialty,
              image_url: publicUrl,
              source: 'google',
              google_place_id: place.place_id,
              image_alt: `${specialty} work by ${place.name}`,
              last_updated: new Date().toISOString()
            })

          if (insertError) {
            console.error('Error inserting image record:', insertError);
          }
        } catch (error) {
          console.error('Error processing photo:', error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${places.length} places for ${specialty}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in fetch-specialty-images:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
