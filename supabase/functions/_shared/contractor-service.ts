
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
      console.log('Attempting to upsert contractor:', contractorData.business_name);
      
      // Ensure required fields are present
      if (!contractorData.business_name || !contractorData.google_place_id) {
        console.error('Missing required fields:', {
          hasBusinessName: !!contractorData.business_name,
          hasGooglePlaceId: !!contractorData.google_place_id
        });
        return false;
      }

      const { error } = await this.supabase
        .from('contractors')
        .upsert(
          {
            ...contractorData,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'google_place_id',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('Upsert error:', error);
        return false;
      }

      console.log('Successfully upserted contractor:', contractorData.business_name);
      return true;
    } catch (error) {
      console.error('Error in upsertContractor:', error);
      return false;
    }
  }
}
