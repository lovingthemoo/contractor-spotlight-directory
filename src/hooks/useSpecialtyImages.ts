
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { fetchSpecialtyImages } from "@/utils/image-fetching";
import type { Database } from "@/integrations/supabase/types";

type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

export const useSpecialtyImages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchHistory = {} } = useQuery({
    queryKey: ['specialtyImageFetchHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialty_image_fetch_history')
        .select('*')
        .order('completed_at', { ascending: false });
      
      if (error) throw error;

      return (data || []).reduce((acc, curr) => {
        if (!acc[curr.specialty] || new Date(acc[curr.specialty].completed_at) < new Date(curr.completed_at)) {
          acc[curr.specialty] = curr;
        }
        return acc;
      }, {} as Record<ContractorSpecialty, typeof data[0]>);
    }
  });

  const fetchSpecialtyImagesForType = async (specialty: ContractorSpecialty) => {
    try {
      const { error: historyError } = await supabase
        .from('specialty_image_fetch_history')
        .insert({
          specialty,
          started_at: new Date().toISOString(),
        });

      if (historyError) throw historyError;

      const result = await fetchSpecialtyImages(specialty);
      
      const { error: updateError } = await supabase
        .from('specialty_image_fetch_history')
        .update({
          completed_at: new Date().toISOString(),
          success: true,
          images_processed: result.processedCount || 0,
        })
        .eq('specialty', specialty)
        .is('completed_at', null);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Completed fetching images for ${specialty}`,
      });

      queryClient.invalidateQueries({ queryKey: ['specialtyImageFetchHistory'] });
      return true;
    } catch (error) {
      console.error('Error fetching specialty images:', error);
      
      await supabase
        .from('specialty_image_fetch_history')
        .update({
          completed_at: new Date().toISOString(),
          success: false,
          error_message: error.message,
        })
        .eq('specialty', specialty)
        .is('completed_at', null);

      toast({
        title: "Error",
        description: `Failed to fetch images for ${specialty}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    fetchHistory,
    fetchSpecialtyImagesForType
  };
};
