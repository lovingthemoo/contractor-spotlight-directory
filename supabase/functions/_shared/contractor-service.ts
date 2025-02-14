
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { ContractorData } from './types.ts';

export class ContractorService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async upsertContractor(contractorData: ContractorData): Promise<boolean> {
    const { error } = await this.supabase
      .from('contractors')
      .upsert(contractorData, {
        onConflict: 'google_place_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to upsert contractor:', error);
      return false;
    }

    return true;
  }
}
