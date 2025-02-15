
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

    const initializeMap = async () => {
      try {
        const cleanAddress = address.trim();
        console.log('Geocoding:', cleanAddress);
        
        // Use HTTPS and the tiles subdomain
        const geocodingUrl = `https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/${
          encodeURIComponent(cleanAddress)
        }.json?access_token=${mapboxToken}&country=GB&limit=1&types=address`;

        const response = await fetch(geocodingUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'Referer': window.location.origin
          },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Geocoding API error:', errorText);
          throw new Error(`Geocoding failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (!data.features?.[0]?.center) {
          throw new Error('No location found');
        }

        const [longitude, latitude] = data.features[0].center;
        console.log('Found coordinates:', { longitude, latitude });

        // Use tiles subdomain for static map as well
        const staticMapUrl = `https://api.tiles.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
          `pin-s+7c3aed(${longitude},${latitude})/` + // Purple pin
          `${longitude},${latitude},` + // Center
          `15/` + // Zoom level
          `600x300` + // Size
          `?access_token=${mapboxToken}`;

        console.log('Generated static map URL');
        setMapUrl(staticMapUrl);
        setError(null);
      } catch (error) {
        console.error('Map generation failed:', error);
        setError('Could not load location map');
      }
    };

    initializeMap();
  }, [address, mapboxToken]);

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <div className="w-full h-[300px] rounded-lg bg-gray-50 overflow-hidden">
        {mapUrl ? (
          <img 
            src={mapUrl}
            alt={`Map showing location of ${address}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Map image failed to load');
              setError('Could not load map image');
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : !error ? (
          <div className="w-full h-full flex items-center justify-center">
            Loading map...
          </div>
        ) : null}
      </div>
    </Card>
  );
};
