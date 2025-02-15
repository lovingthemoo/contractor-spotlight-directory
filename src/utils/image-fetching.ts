
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

export const fetchSpecialtyImages = async (specialty: ContractorSpecialty) => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-specialty-images', {
      body: { specialty }
    });
    
    if (error) {
      console.error('Error fetching specialty images:', error);
      throw error;
    }
    
    console.log('Fetch response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch specialty images:', error);
    throw error;
  }
};
