
import { supabase } from "@/integrations/supabase/client";

export const migrateSpecialtyImages = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('migrate-specialty-images');
    
    if (error) {
      console.error('Migration error:', error);
      throw error;
    }
    
    console.log('Migration response:', data);
    return data;
  } catch (error) {
    console.error('Failed to migrate specialty images:', error);
    throw error;
  }
};
