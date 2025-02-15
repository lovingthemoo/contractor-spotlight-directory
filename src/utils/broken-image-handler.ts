
import { supabase } from "@/integrations/supabase/client";
import { isValidSpecialty } from "./specialty-validator";
import type { ContractorSpecialty } from "@/types/image-types";

export const markImageAsBroken = async (url: string, specialty?: string) => {
  if (!url) {
    console.debug('No URL provided to mark as broken');
    return;
  }

  try {
    // Only include specialty if it's valid
    const validatedSpecialty = specialty && isValidSpecialty(specialty) ? specialty : null;
    
    // Check if this URL is already marked as broken
    const { data: existing } = await supabase
      .from('broken_image_urls')
      .select('id')
      .eq('url', url)
      .maybeSingle();

    if (existing) {
      console.debug('URL already marked as broken:', url);
      return;
    }

    const { error } = await supabase
      .from('broken_image_urls')
      .insert({
        url,
        specialty: validatedSpecialty,
        reported_by: 'system',
        error_message: 'Image failed to load'
      })
      .single();

    if (error) {
      console.error('Error marking image as broken:', error);
    }
  } catch (error) {
    console.error('Error in markImageAsBroken:', error);
  }
};

export const getBrokenUrls = async (specialty: ContractorSpecialty): Promise<string[]> => {
  try {
    const { data: brokenUrls, error } = await supabase
      .from('broken_image_urls')
      .select('url')
      .eq('specialty', specialty);

    if (error) {
      console.error('Error fetching broken URLs:', error);
      return [];
    }

    return (brokenUrls || []).map(item => item.url);
  } catch (error) {
    console.error('Error getting broken URLs:', error);
    return [];
  }
};
