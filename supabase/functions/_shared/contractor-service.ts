
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { ContractorData } from './types.ts';

export class ContractorService {
  private supabase;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upsertContractor(contractorData: ContractorData): Promise<boolean> {
    try {
      console.log('Starting upsert for contractor:', contractorData.business_name);
      
      // Validate required fields
      if (!contractorData.business_name || !contractorData.google_place_id) {
        console.error('Missing required fields:', {
          hasBusinessName: !!contractorData.business_name,
          hasGooglePlaceId: !!contractorData.google_place_id
        });
        return false;
      }

      // Determine enrichment flags based on data presence
      const enrichmentFlags = {
        needs_google_enrichment: !contractorData.rating || !contractorData.google_business_scopes,
        needs_image_enrichment: !contractorData.google_photos?.length,
        needs_contact_enrichment: !contractorData.google_formatted_phone && !contractorData.website_url,
      };

      console.log('Enrichment flags:', {
        business: contractorData.business_name,
        ...enrichmentFlags,
        hasRating: !!contractorData.rating,
        hasPhotos: !!contractorData.google_photos?.length,
        hasPhone: !!contractorData.google_formatted_phone,
        hasWebsite: !!contractorData.website_url
      });

      // Prepare data for upsert
      const upsertData = {
        ...contractorData,
        ...enrichmentFlags,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('contractors')
        .upsert(upsertData, {
          onConflict: 'google_place_id'
        })
        .select('id, business_name, needs_google_enrichment, needs_image_enrichment, needs_contact_enrichment');

      if (error) {
        console.error('Supabase upsert error:', error);
        return false;
      }

      console.log('Successfully upserted contractor:', {
        business_name: contractorData.business_name,
        id: data?.[0]?.id,
        enrichmentFlags: data?.[0] ? {
          needs_google_enrichment: data[0].needs_google_enrichment,
          needs_image_enrichment: data[0].needs_image_enrichment,
          needs_contact_enrichment: data[0].needs_contact_enrichment
        } : 'No data returned'
      });

      return true;
    } catch (error) {
      console.error('Error in upsertContractor:', error);
      return false;
    }
  }
}
