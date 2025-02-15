
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BusinessLocationProps {
  address: string;
}

interface Coordinates {
  lng: number;
  lat: number;
}

export const BusinessLocation = ({ address }: BusinessLocationProps) => {
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

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

  // Geocode the address to get coordinates
  useEffect(() => {
    if (!mapboxToken || !address) return;

    const geocodeAddress = async () => {
      try {
        // Ensure address is a string and properly formatted
        const cleanAddress = address.trim();
        if (!cleanAddress) {
          setError('No address provided');
          return;
        }

        // Append 'London, UK' if not present to improve geocoding accuracy
        const fullAddress = cleanAddress.toLowerCase().includes('london') 
          ? cleanAddress 
          : `${cleanAddress}, London, UK`;

        console.log('Geocoding address:', fullAddress);
        const encodedAddress = encodeURIComponent(fullAddress);
        
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&country=GB&limit=1`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Geocoding failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          console.log('Geocoding successful:', { lng, lat });
          setCoordinates({ lng, lat });
          setError(null);
        } else {
          console.error('No coordinates found for address');
          setError('Could not find location on map');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Could not load location coordinates');
      }
    };

    geocodeAddress();
  }, [address, mapboxToken]);

  // Generate static map URL once we have coordinates
  useEffect(() => {
    if (!mapboxToken || !coordinates) return;

    try {
      const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l(${coordinates.lng},${coordinates.lat})/${coordinates.lng},${coordinates.lat},14/800x400@2x?access_token=${mapboxToken}`;
      console.log('Static map URL generated successfully');
      setMapUrl(staticMapUrl);
      setError(null);
    } catch (err) {
      console.error('Error generating map URL:', err);
      setError('Could not load location map');
    }
  }, [coordinates, mapboxToken]);

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
