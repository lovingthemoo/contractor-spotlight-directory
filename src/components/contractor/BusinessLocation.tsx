
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
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'mapbox_public_token')
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Mapbox token not found');
      return data.value;
    }
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

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

        // Initialize Mapbox with access token
        mapboxgl.accessToken = mapboxToken;

        // Clean and encode the address
        const cleanAddress = address.trim();
        console.log('Geocoding address:', cleanAddress);
        
        // Construct geocoding URL with proper parameters
        const geocodingUrl = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(cleanAddress) + '.json');
        geocodingUrl.searchParams.append('access_token', mapboxToken);
        geocodingUrl.searchParams.append('country', 'GB');
        geocodingUrl.searchParams.append('limit', '1');
        geocodingUrl.searchParams.append('types', 'address');

        const response = await fetch(geocodingUrl.toString());
        
        if (!response.ok) {
          throw new Error(`Geocoding failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Geocoding response:', data);

        if (!data.features || data.features.length === 0) {
          throw new Error('No location found for the provided address');
        }

        const [lng, lat] = data.features[0].center;
        console.log('Coordinates:', { lng, lat });

        // Create new map instance
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 15,
          minZoom: 9,
          maxZoom: 17
        });

        // Add marker with popup
        new mapboxgl.Marker({ color: '#7c3aed' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div class="p-2"><strong>${address}</strong></div>`))
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl({
          showCompass: false
        }), 'top-right');

        // Clear any previous errors
        setError(null);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load map';
        console.error('Error initializing map:', error);
        setError(errorMessage);
      }
    };

    // Initialize map with small delay to ensure container is ready
    const timeoutId = setTimeout(() => {
      initializeMap();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [address, mapboxToken]);

  if (!mapboxToken) {
    return (
      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div>Loading map...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Location</h3>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : null}
      <div ref={mapContainer} className="w-full h-[300px] rounded-lg" />
    </Card>
  );
};
