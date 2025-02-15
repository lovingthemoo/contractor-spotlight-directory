
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Specialty image mappings from our image util files
const specialtyImageMap = {
  roofing: [
    "1632939809861-5a027131c902",
    "1635424635889-ae5b10825d82",
    "1600585152220-90363fe7e115",
    "1632939525652-d769f925cf88",
    "1632939587047-4f65c9c90a1a"
  ],
  building: [
    "1486944936320-044d441619f1",
    "1515263487990-c859c69e0d51",
    "1486304873000-235643847519",
    "1523217582562-09d95dc6678f",
    "1592928038403-5c27bd11d535"
  ],
  electrical: [
    "1573321993197-d6de9c0bc13f",
    "1545167871-65b8aee21c03",
    "1521224616346-91bbb3d0138b",
    "1589939705384-5185137a7f0f",
    "1581092160562-40cea0e01cbb"
  ],
  plumbing: [
    "1584466977375-bc7603e1090d",
    "1584622650111-93e69d876a0c",
    "1584622965147-af357855e4b6",
    "1581092581146-a52a1b7148b9",
    "1581092160562-40cea0e01cbb"
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results = {
      success: [] as string[],
      errors: [] as string[]
    };

    // Process each specialty and its images
    for (const [specialty, imageIds] of Object.entries(specialtyImageMap)) {
      console.log(`Processing ${specialty} images...`);
      
      for (const imageId of imageIds) {
        try {
          const imageUrl = `https://images.unsplash.com/photo-${imageId}`;
          const storagePath = `specialty/${specialty}/${imageId}.jpg`;

          // Download the image
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
          }

          const imageBlob = await imageResponse.blob();

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('contractor-images')
            .upload(storagePath, imageBlob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('contractor-images')
            .getPublicUrl(storagePath);

          // Insert or update the image record
          const { error: dbError } = await supabase
            .from('contractor_images')
            .upsert({
              image_type: 'specialty',
              storage_path: storagePath,
              original_url: imageUrl,
              priority: imageIds.indexOf(imageId) + 1
            }, {
              onConflict: 'storage_path'
            });

          if (dbError) {
            throw dbError;
          }

          results.success.push(imageId);
          console.log(`Successfully processed ${specialty}/${imageId}`);
        } catch (error) {
          const errorMessage = `Error processing ${specialty}/${imageId}: ${error.message}`;
          results.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Image migration completed',
        results
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Migration failed',
        details: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
