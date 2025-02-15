
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
  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      console.log('Fetching Mapbox token...');
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'mapbox_public_token')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching Mapbox token:', error);
        throw error;
      }
      if (!data) {
        console.error('Mapbox token not found in app_settings');
        throw new Error('Mapbox token not found');
      }
      console.log('Found Mapbox token:', data);
      return data.value;
    }
  });

  useEffect(() => {
    if (!mapboxToken) {
      console.log('No Mapbox token available yet');
      return;
    }

    console.log('Starting map initialization with address:', address);

    // Validate address
    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      console.error('Invalid address provided:', address);
      setError('Invalid address provided');
      return;
    }

    const showMap = () => {
      try {
        const cleanAddress = address.trim();
        console.log('Preparing map for address:', cleanAddress);
        
        // Basic static map of London with high resolution
        const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
          `[-0.1276,51.5072]` + // London center coordinates
          `,11` + // Zoom level
          `/800x400` + // Higher resolution
          `@2x` + // Retina display support
          `?padding=50` +
          `&access_token=${mapboxToken}`;

        console.log('Generated static map URL');
        setMapUrl(staticMapUrl);
        setError(null);
      } catch (error) {
        console.error('Map generation failed:', error);
        setError('Could not load location map');
      }
    };

    showMap();
  }, [address, mapboxToken]);

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <div className="w-full h-[300px] rounded-lg bg-gray-50 overflow-hidden">
        {mapUrl ? (
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
        ) : !error ? (
          <div className="w-full h-full flex items-center justify-center">
            Loading map...
          </div>
        ) : null}
      </div>
    </Card>
  );
};
