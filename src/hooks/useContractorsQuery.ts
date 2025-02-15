
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformContractor } from "@/utils/contractor-transformer";
import { toast } from "sonner";

export const useContractorsQuery = () => {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // First get contractors with default specialty images and good ratings
        const { data: defaultImageContractors = [], error: defaultError } = await supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .not('default_specialty_image', 'is', null)
          .order('rating', { ascending: false });

        // Then get contractors with Google photos
        const { data: googlePhotoContractors = [], error: googleError } = await supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .is('default_specialty_image', null)
          .not('google_photos', 'eq', '[]')
          .order('rating', { ascending: false });

        // Finally get remaining contractors with uploaded images
        const { data: uploadedImageContractors = [], error: uploadedError } = await supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .is('default_specialty_image', null)
          .eq('google_photos', '[]')
          .not('images', 'eq', '{}')
          .order('rating', { ascending: false });

        if (defaultError || googleError || uploadedError) {
          console.error('Failed to fetch contractors:', { defaultError, googleError, uploadedError });
          toast.error('Failed to fetch contractors');
          throw defaultError || googleError || uploadedError;
        }

        // Combine all contractors in the desired order
        const contractorsData = [
          ...defaultImageContractors,
          ...googlePhotoContractors,
          ...uploadedImageContractors
        ];

        if (!contractorsData.length) {
          console.log('No contractors found with images');
          return [];
        }

        console.log('Fetched contractors data:', {
          totalCount: contractorsData.length,
          withDefaultImages: defaultImageContractors.length,
          withGooglePhotos: googlePhotoContractors.length,
          withUploadedImages: uploadedImageContractors.length
        });

        // Transform contractors
        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        // Sort within each group by rating
        return transformedContractors.sort((a, b) => {
          // First check which category each contractor belongs to
          const aCategory = a.default_specialty_image ? 3 
            : (Array.isArray(a.google_photos) && a.google_photos.length > 0) ? 2 
            : (Array.isArray(a.images) && a.images.length > 0) ? 1 : 0;
          
          const bCategory = b.default_specialty_image ? 3 
            : (Array.isArray(b.google_photos) && b.google_photos.length > 0) ? 2 
            : (Array.isArray(b.images) && b.images.length > 0) ? 1 : 0;
          
          // If categories are different, sort by category
          if (aCategory !== bCategory) {
            return bCategory - aCategory;
          }
          
          // Within same category, sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });
      } catch (e) {
        console.error('Error fetching contractors:', e);
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
