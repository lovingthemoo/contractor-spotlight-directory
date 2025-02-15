
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformContractor } from "@/utils/contractor-transformer";
import { toast } from "sonner";

export const useContractorsQuery = () => {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // Get all contractors that have any kind of images
        const withImagesQuery = supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .or('google_photos.neq.[],(default_specialty_image.neq.null,images.neq.{})')
          .order('rating', { ascending: false });

        const withImagesResponse = await withImagesQuery;
        
        if (withImagesResponse.error) {
          toast.error('Failed to fetch contractors');
          throw withImagesResponse.error;
        }

        let contractorsData = withImagesResponse.data || [];
        
        // If we need more contractors, get the rest
        if (contractorsData.length < 10) {
          const remainingQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .not('id', 'in', `(${contractorsData.map(c => `'${c.id}'`).join(',')})`)
            .order('rating', { ascending: false });

          const remainingResponse = await remainingQuery;

          if (!remainingResponse.error && remainingResponse.data) {
            contractorsData = [...contractorsData, ...remainingResponse.data];
          }
        }

        // Transform and sort contractors
        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        return transformedContractors.sort((a, b) => {
          // First, prioritize contractors with Google photos (fastest to load)
          const aHasGooglePhotos = (a.google_photos?.length > 0) ? 3 : 0;
          const bHasGooglePhotos = (b.google_photos?.length > 0) ? 3 : 0;
          
          // Then those with uploaded images
          const aHasUploadedImages = (a.images?.length > 0) ? 2 : 0;
          const bHasUploadedImages = (b.images?.length > 0) ? 2 : 0;
          
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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
