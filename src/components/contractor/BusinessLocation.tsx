
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BusinessLocationProps {
  address: string;
}

export const BusinessLocation = ({ address }: BusinessLocationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (!mapboxToken) return;

    // Validate address
    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      console.error('Invalid address provided:', address);
      setError('Invalid address provided');
      return;
    }

    const initializeMap = async () => {
      try {
        // Ensure any existing map is cleaned up
        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        // Wait for container to be properly sized
        if (!mapContainer.current?.offsetWidth || !mapContainer.current?.offsetHeight) {
          console.log('Container not ready, waiting...');
          return;
        }

        // Initialize Mapbox with access token
        mapboxgl.accessToken = mapboxToken;

        // Clean and encode the address
        const cleanAddress = address.trim();
        console.log('Attempting to geocode address:', cleanAddress);

        try {
          // Perform geocoding first
          const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
          const encodedAddress = encodeURIComponent(cleanAddress);
          const params = new URLSearchParams({
            access_token: mapboxToken,
            country: 'GB',
            limit: '1',
            types: 'address'
          });
          
          const geocodingUrl = `${baseUrl}/${encodedAddress}.json?${params}`;
          console.log('Geocoding URL:', geocodingUrl);

          const response = await fetch(geocodingUrl);
          console.log('Geocoding response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Geocoding failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Geocoding response data:', data);

          if (!data.features || data.features.length === 0) {
            throw new Error('No location found for the provided address');
          }

          const [lng, lat] = data.features[0].center;
          console.log('Found coordinates:', { lng, lat });

          // Initialize map only after we have coordinates
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 15,
            minZoom: 9,
            maxZoom: 17,
            fadeDuration: 0 // Disable fade animations
          });

          // Wait for map to load before adding controls and markers
          map.current.on('load', () => {
            // Add navigation controls
            map.current?.addControl(new mapboxgl.NavigationControl({
              showCompass: false
            }), 'top-right');

            // Add marker with popup
            new mapboxgl.Marker({ color: '#7c3aed' })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="p-2"><strong>${address}</strong></div>`))
              .addTo(map.current!);
          });

          // Clear any previous errors
          setError(null);

        } catch (geocodingError) {
          console.error('Geocoding error:', geocodingError);
          setError(`Could not find location: ${geocodingError.message}`);
          
          // Initialize map with default London center if geocoding fails
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-0.1276, 51.5072],
            zoom: 15,
            minZoom: 9,
            maxZoom: 17,
            fadeDuration: 0
          });

          map.current.on('load', () => {
            map.current?.addControl(new mapboxgl.NavigationControl({
              showCompass: false
            }), 'top-right');
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load map';
        console.error('Map initialization error:', error);
        setError(errorMessage);
      }
    };

    // Add a brief delay to ensure container is mounted and sized
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [address, mapboxToken]);

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : null}
      <div 
        ref={mapContainer} 
        className="w-full h-[300px] rounded-lg"
        style={{ visibility: mapboxToken ? 'visible' : 'hidden' }}
      />
    </Card>
  );
};
