
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
    let records

    try {
      // First try parsing as regular CSV
      records = parse(fileContent, { skipFirstRow: true })
    } catch (parseError) {
      console.error('Error parsing CSV:', parseError)
      // If regular parsing fails, try parsing as JSON
      try {
        const jsonData = JSON.parse(fileContent)
        records = Array.isArray(jsonData) ? jsonData : [jsonData]
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError)
        return new Response(
          JSON.stringify({ error: 'Invalid file format. Please provide a valid CSV or JSON file.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const successfulImports = []
    const failedImports = []

    for (const record of records) {
      try {
        // Try to map the record using common variations of field names
        const contractorData = {
          business_name: record.business_name || record.businessName || record.rgnuSb || record['Business Name'],
          trading_name: record.trading_name || record.tradingName || record['Trading Name'] || null,
          specialty: (record.specialty || record.speciality || record.hGz87c || record['Specialty'] || 'GENERAL')
            .toString().toUpperCase(),
          phone: record.phone || record.phoneNumber || record.hGz87c3 || record['Phone'] || null,
          email: record.email || record['Email'] || null,
          website_url: record.website_url || record.websiteUrl || record['Website URL'] || 
            record['keychainify-checked href'] || null,
          location: record.location || record.hGz87c2 || record['Location'] || 'London',
          postal_code: record.postal_code || record.postalCode || record['Postal Code'] || null,
          description: record.description || record['Description'] || null
        }

        // Validate required fields
        if (!contractorData.business_name) {
          throw new Error('Business name is required')
        }

        // Generate slug if not provided
        contractorData.slug = record.slug || 
          contractorData.business_name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        const { error } = await supabase
          .from('contractors')
          .insert(contractorData)

        if (error) {
          console.error('Error importing record:', error)
          failedImports.push({ record: contractorData, error: error.message })
        } else {
          successfulImports.push(contractorData)
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
      JSON.stringify({ error: 'Failed to process file', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
