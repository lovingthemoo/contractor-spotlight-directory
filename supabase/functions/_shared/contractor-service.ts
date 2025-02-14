
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

      // Log the exact data being sent to Supabase
      console.log('Upserting data:', {
        business_name: contractorData.business_name,
        google_place_id: contractorData.google_place_id,
        google_place_name: contractorData.google_place_name,
        google_formatted_address: contractorData.google_formatted_address,
        slug: contractorData.slug
      });

      const { data, error } = await this.supabase
        .from('contractors')
        .upsert(
          {
            ...contractorData,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'google_place_id'
          }
        )
        .select('id');

      if (error) {
        console.error('Supabase upsert error:', error);
        return false;
      }

      console.log('Successfully upserted contractor:', {
        business_name: contractorData.business_name,
        id: data?.[0]?.id
      });
      return true;
    } catch (error) {
      console.error('Error in upsertContractor:', error);
      return false;
    }
  }
}
