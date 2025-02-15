
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BusinessLocationProps {
  address: string;
  google_formatted_address?: string;
  google_place_id?: string;
  google_photos?: any[];
}

export const BusinessLocation = ({ 
  address,
  google_formatted_address,
  google_place_id,
  google_photos
}: BusinessLocationProps) => {
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  // Fetch Mapbox token from app_settings
  const { data: mapboxToken, isLoading: isLoadingToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      console.log('Fetching Mapbox token...');
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'mapbox_public_token')
        .single();
      
      if (error) {
        console.error('Error fetching Mapbox token:', error);
        throw error;
      }
      console.log('Found Mapbox token:', data.value.slice(0, 10) + '...');
      return data.value;
    }
  });

  useEffect(() => {
    if (!mapboxToken || !google_place_id) {
      console.log('Missing required data:', { 
        hasToken: !!mapboxToken, 
        hasPlaceId: !!google_place_id 
      });
      return;
    }

    try {
      // Use static map centered on London if no specific location
      const defaultLocation = { lng: -0.1276, lat: 51.5074 }; // London coordinates
      const zoomLevel = google_place_id ? '14' : '10';

      // Use the static map URL directly
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l(${defaultLocation.lng},${defaultLocation.lat})/${defaultLocation.lng},${defaultLocation.lat},${zoomLevel}/800x400@2x?access_token=${mapboxToken}`;
      
      console.log('Static map URL generated successfully');
      setMapUrl(staticMapUrl);
      setError(null);
    } catch (err) {
      console.error('Error generating map URL:', err);
      setError('Could not load location map');
    }
  }, [mapboxToken, google_place_id]);

  if (isLoadingToken) {
    return (
      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="w-full h-[300px] rounded-lg bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="w-full h-[300px] rounded-lg bg-gray-50 overflow-hidden">
          {mapUrl && (
            <div className="relative w-full h-full">
              <img 
                src={mapUrl}
                alt={`Map showing location of ${google_formatted_address || address}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Map image failed to load');
                  setError('Could not load map image');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-2 rounded-md text-sm">
                {google_formatted_address || address}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
