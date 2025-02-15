
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface BusinessLocationProps {
  address: string;
}

export const BusinessLocation = ({ address }: BusinessLocationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Validate address
    if (!address || address.trim().length < 3) {
      console.error('Invalid address provided:', address);
      setError('Invalid address provided');
      return;
    }

    const initializeMap = async () => {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHU1Z3M5cDUwMGo1MmtvNmZyYnF3dXg0In0.jkxpNrQzIBMPqx_zO2TBVA';

      try {
        // Ensure any existing map is cleaned up
        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        // Geocode the address
        console.log('Geocoding address:', address);
        const encodedAddress = encodeURIComponent(address);
        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxgl.accessToken}&country=GB`;
        
        const response = await fetch(geocodingUrl);
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

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 14
        });

        // Add marker
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Clear any previous errors
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load map';
        console.error('Error initializing map:', error);
        setError(errorMessage);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [address]);

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
