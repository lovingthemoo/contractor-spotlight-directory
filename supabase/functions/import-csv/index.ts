
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const validSpecialties = ['Electrical', 'Plumbing', 'Roofing', 'Building', 'Home Repair', 'Gardening', 'Construction', 'Handyman'];

// Map specialties to valid enum values
const mapSpecialty = (specialty: string): string => {
  const normalizedSpecialty = specialty?.toString().trim().toLowerCase() || '';

  // Define mappings for various terms
  if (normalizedSpecialty.includes('electric')) return 'Electrical';
  if (normalizedSpecialty.includes('plumb')) return 'Plumbing';
  if (normalizedSpecialty.includes('roof')) return 'Roofing';
  
  // Building and Construction related terms
  const buildingTerms = ['build', 'contractor', 'construct', 'extension', 'renovation', 'remodel'];
  if (buildingTerms.some(term => normalizedSpecialty.includes(term))) {
    return 'Building';
  }
  
  if (normalizedSpecialty.includes('repair') || normalizedSpecialty.includes('fix')) return 'Home Repair';
  if (normalizedSpecialty.includes('garden') || normalizedSpecialty.includes('landscape')) return 'Gardening';
  if (normalizedSpecialty.includes('construct')) return 'Construction';
  if (normalizedSpecialty.includes('handy') || normalizedSpecialty.includes('general')) return 'Handyman';
  
  return 'Handyman'; // Default fallback
};

serve(async (req) => {
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
        console.log('Processing raw record:', record)

        // Clean and prepare data
        const cleanValue = (value: any) => {
          if (typeof value === 'string') {
            // Remove quotes and trim
            return value.replace(/^["']|["']$/g, '').trim()
          }
          return value
        }

        // Try to map the record using common variations of field names
        const contractorData = {
          business_name: cleanValue(record.business_name || record.businessName || record.rgnuSb || record['Business Name'] || record['business name']),
          trading_name: cleanValue(record.trading_name || record.tradingName || record['Trading Name'] || record['trading name'] || null),
          specialty: mapSpecialty(cleanValue(record.specialty || record.speciality || record.hGz87c || record['Specialty'] || record['specialty'] || 'Handyman')),
          phone: cleanValue(record.phone || record.phoneNumber || record.hGz87c3 || record['Phone'] || record['phone'] || null),
          email: cleanValue(record.email || record['Email'] || record['email'] || null),
          website_url: cleanValue(record.website_url || record.websiteUrl || record['Website URL'] || record['website url'] || 
            record['keychainify-checked href'] || null),
          location: cleanValue(record.location || record.hGz87c2 || record['Location'] || record['location'] || 'London'),
          postal_code: cleanValue(record.postal_code || record.postalCode || record['Postal Code'] || record['postal code'] || null),
          description: cleanValue(record.description || record['Description'] || record['description'] || null)
        }

        console.log('Mapped data:', contractorData)

        // Validate required fields
        if (!contractorData.business_name) {
          throw new Error('Business name is required')
        }

        // Generate slug if not provided
        const baseSlug = contractorData.business_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Add a random suffix to make the slug unique
        const timestamp = new Date().getTime()
        contractorData.slug = `${baseSlug}-${timestamp.toString().slice(-6)}`

        console.log('Final contractor data:', contractorData)

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
