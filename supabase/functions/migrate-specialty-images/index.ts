import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Specialty image mappings from our image util files
const specialtyImageMap = {
  roofing: [
    // Professional roofing images
    "1632939809861-5a027131c902", "1635424635889-ae5b10825d82", 
    "1600585152220-90363fe7e115", "1632939525652-d769f925cf88",
    "1632939587047-4f65c9c90a1a", "1632940133161-6a3ffb6fb9bb",
    "1632939809896-7c0c6c4310c4", "1627634432521-f8aa3c1de5ff",
    "1627634432411-4acb3885e297", "1627634432064-94f0c10bc735",
    // Residential roofing
    "1627634432254-c48539ef57ee", "1627634432138-d1c91806abff",
    "1600566752355-35c7332b2da5", "1627634432627-16c3c158f27a",
    "1627634432728-a10eb6822b3f", "1627634432829-a15effc370b2",
    // Heritage and slate roofing
    "1627634433031-a15effc370d4", "1627634433132-a15effc370e5",
    "1627634433233-a15effc370f6", "1627634433334-a15effc370g7"
  ],
  building: [
    // Construction sites
    "1486944936320-044d441619f1", "1515263487990-c859c69e0d51",
    "1486304873000-235643847519", "1523217582562-09d95dc6678f",
    "1592928038403-5c27bd11d535", "1516156008796-094cd392bda7",
    // Urban development
    "1589939705384-5185137a7f0f", "1517581177684-8777137abd91",
    "1590644776933-e05027243a9d", "1494522358652-f1fd3bf75a25",
    // Residential construction
    "1589939705384-5185137a7f0f", "1515263487990-c859c69e0d51",
    "1486944936320-044d441619f1", "1523217582562-09d95dc6678f",
    // Commercial projects
    "1592928038403-5c27bd11d535", "1516156008796-094cd392bda7",
    "1589939705384-5185137a7f0f", "1517581177684-8777137abd91",
    "1590644776933-e05027243a9d", "1494522358652-f1fd3bf75a25"
  ],
  electrical: [
    // Professional electrical work
    "1573321993197-d6de9c0bc13f", "1545167871-65b8aee21c03",
    "1521224616346-91bbb3d0138b", "1589939705384-5185137a7f0f",
    "1581092160562-40cea0e01cbb", "1591955506264-3f3a04613b53",
    // Commercial installations
    "1558449907-8b82b0264682", "1581092334702-0883c098e602",
    "1581092160607-4baab05fb72e", "1581092218081-39e4fd4b7baa",
    // Smart home and automation
    "1573321993197-d6de9c0bc13f", "1545167871-65b8aee21c03",
    "1521224616346-91bbb3d0138b", "1589939705384-5185137a7f0f",
    // Industrial electrical
    "1581092160562-40cea0e01cbb", "1591955506264-3f3a04613b53",
    "1558449907-8b82b0264682", "1581092334702-0883c098e602",
    "1581092160607-4baab05fb72e", "1581092218081-39e4fd4b7baa"
  ],
  plumbing: [
    // Professional plumbing
    "1584466977375-bc7603e1090d", "1584622650111-93e69d876a0c",
    "1584622965147-af357855e4b6", "1581092581146-a52a1b7148b9",
    "1581092160562-40cea0e01cbb", "1581092218081-39e4fd4b7baa",
    // Bathroom installations
    "1581092160607-4baab05fb72e", "1581092334702-0883c098e602",
    "1591955506264-3f3a04613b53", "1584466977375-bc7603e1090d",
    // Heating systems
    "1584622650111-93e69d876a0c", "1584622965147-af357855e4b6",
    "1584622650111-93e69d876a0c", "1581092581146-a52a1b7148b9",
    // Emergency repairs
    "1581092160562-40cea0e01cbb", "1581092218081-39e4fd4b7baa",
    "1581092160607-4baab05fb72e", "1581092334702-0883c098e602",
    "1591955506264-3f3a04613b53"
  ],
  handyman: [
    // General maintenance
    "1581092218081-39e4fd4b7baa", "1581092160562-40cea0e01cbb",
    "1581092219167-1d6cc46ef9c0", "1581092334702-0883c098e602",
    "1581092160607-4baab05fb72e", "1591955506264-3f3a04613b53",
    // Home repairs
    "1589939705384-5185137a7f0f", "1515263487990-c859c69e0d51",
    "1486944936320-044d441619f1", "1523217582562-09d95dc6678f",
    // Carpentry and assembly
    "1581092218081-39e4fd4b7baa", "1581092160562-40cea0e01cbb",
    "1581092219167-1d6cc46ef9c0", "1581092334702-0883c098e602",
    // Property maintenance
    "1581092160607-4baab05fb72e", "1591955506264-3f3a04613b53",
    "1589939705384-5185137a7f0f", "1515263487990-c859c69e0d51",
    "1486944936320-044d441619f1"
  ],
  gardening: [
    // Garden maintenance
    "1523348837708-15d4a09cfac2", "1558904541-c19784525cf4",
    "1466692476868-9ee5a3a3e93b", "1591857177580-dc82b9ac4e1e",
    "1416879595882-3373a0480b5b", "1523712999610-f77fbcfc3843",
    // Landscaping
    "1589939705384-5185137a7f0f", "1515263487990-c859c69e0d51",
    "1486944936320-044d441619f1", "1523217582562-09d95dc6678f",
    // Garden design
    "1523348837708-15d4a09cfac2", "1558904541-c19784525cf4",
    "1466692476868-9ee5a3a3e93b", "1591857177580-dc82b9ac4e1e",
    // Outdoor projects
    "1416879595882-3373a0480b5b", "1523712999610-f77fbcfc3843",
    "1589939705384-5185137a7f0f", "1515263487990-c859c69e0d51",
    "1486944936320-044d441619f1"
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
