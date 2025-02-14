
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No CSV file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const fileContent = await file.text()
    const records = parse(fileContent, { skipFirstRow: true })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const successfulImports = []
    const failedImports = []

    for (const record of records) {
      try {
        const [
          business_name,
          trading_name,
          specialty,
          phone,
          email,
          website_url,
          location,
          postal_code,
          description,
          slug
        ] = record

        const { error } = await supabase
          .from('contractors')
          .insert({
            business_name,
            trading_name: trading_name || null,
            specialty: specialty.toUpperCase(),
            phone: phone || null,
            email: email || null,
            website_url: website_url || null,
            location,
            postal_code: postal_code || null,
            description: description || null,
            slug: slug || business_name.toLowerCase().replace(/\s+/g, '-')
          })

        if (error) {
          console.error('Error importing record:', error)
          failedImports.push({ record, error: error.message })
        } else {
          successfulImports.push(record)
        }
      } catch (error) {
        console.error('Error processing record:', error)
        failedImports.push({ record, error: error.message })
      }
    }

    // Log the import results
    const { error: logError } = await supabase
      .from('upload_logs')
      .insert({
        filename: file.name,
        success_count: successfulImports.length,
        error_count: failedImports.length,
        errors: failedImports.length > 0 ? failedImports : null,
        status: failedImports.length === 0 ? 'success' : 'partial'
      })

    if (logError) {
      console.error('Error logging import:', logError)
    }

    return new Response(
      JSON.stringify({
        message: 'Import completed',
        successful: successfulImports.length,
        failed: failedImports.length,
        failures: failedImports
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process CSV file', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
