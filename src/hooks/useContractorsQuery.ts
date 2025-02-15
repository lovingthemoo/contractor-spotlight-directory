
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformContractor } from "@/utils/contractor-transformer";
import { toast } from "sonner";

export const useContractorsQuery = () => {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // Simplified query with individual filters
        const { data: contractorsData, error } = await supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .or('google_photos.neq.[]')
          .order('rating', { ascending: false });
        
        if (error) {
          console.error('Failed to fetch contractors:', error);
          toast.error('Failed to fetch contractors');
          throw error;
        }

        if (!contractorsData?.length) {
          console.log('No contractors found with images');
          return [];
        }

        console.log('Fetched contractors data:', {
          totalCount: contractorsData.length,
          withImages: contractorsData.filter(c => 
            (Array.isArray(c.google_photos) && c.google_photos.length > 0) || 
            c.default_specialty_image || 
            (Array.isArray(c.images) && c.images.length > 0)
          ).length
        });

        // Transform and sort contractors
        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        return transformedContractors.sort((a, b) => {
          // First, prioritize contractors with Google photos (fastest to load)
          const aHasGooglePhotos = (Array.isArray(a.google_photos) && a.google_photos.length > 0) ? 3 : 0;
          const bHasGooglePhotos = (Array.isArray(b.google_photos) && b.google_photos.length > 0) ? 3 : 0;
          
          // Then those with uploaded images
          const aHasUploadedImages = (Array.isArray(a.images) && a.images.length > 0) ? 2 : 0;
          const bHasUploadedImages = (Array.isArray(b.images) && b.images.length > 0) ? 2 : 0;
          
          // Finally those with default specialty images
          const aHasDefaultImage = a.default_specialty_image ? 1 : 0;
          const bHasDefaultImage = b.default_specialty_image ? 1 : 0;
          
          const aImageScore = aHasGooglePhotos + aHasUploadedImages + aHasDefaultImage;
          const bImageScore = bHasGooglePhotos + bHasUploadedImages + bHasDefaultImage;
          
          if (aImageScore !== bImageScore) {
            return bImageScore - aImageScore;
          }
          
          // If image scores are equal, sort by rating
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
