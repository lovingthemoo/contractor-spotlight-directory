
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BusinessLocationProps {
  address: string;
}

export const BusinessLocation = ({ address }: BusinessLocationProps) => {
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
      console.log('Found Mapbox token');
      return data.value;
    }
  });

  useEffect(() => {
    if (isLoadingToken || !mapboxToken) {
      console.log('Waiting for Mapbox token...');
      return;
    }

    if (!address) {
      console.error('No address provided');
      setError('Address information unavailable');
      return;
    }

    console.log('Generating map for address:', address);
    
    try {
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l(0,0)/-0.1276,51.5072,11/800x400@2x?access_token=${mapboxToken}`;
      console.log('Map URL generated');
      setMapUrl(staticMapUrl);
      setError(null);
    } catch (err) {
      console.error('Error generating map URL:', err);
      setError('Could not load location map');
    }
  }, [address, mapboxToken, isLoadingToken]);

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
                alt={`Map showing location of ${address}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Map image failed to load');
                  setError('Could not load map image');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-2 rounded-md text-sm">
                {address}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
