
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
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
  const [showMap, setShowMap] = useState(false);

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

        // Initialize with default London coordinates
        const defaultCoords: LngLatLike = [-0.1276, 51.5072];
        
        // Initialize Mapbox with access token
        mapboxgl.accessToken = mapboxToken;

        console.log('Initializing map with token:', mapboxToken);

        // Try to create map with basic configuration and fallbacks
        try {
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/basic-v9', // Simpler style that might work better with CSP
            center: defaultCoords,
            zoom: 15,
            minZoom: 9,
            maxZoom: 17,
            antialias: false, // Disable antialiasing
            dragRotate: false, // Disable 3D rotation
            attributionControl: false // We'll add this manually
          });

          // Add attribution control separately
          map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

          // Basic navigation controls
          map.current.addControl(new mapboxgl.NavigationControl({
            showCompass: false
          }), 'top-right');

          // Set up loading handlers
          map.current.once('load', () => {
            console.log('Map base loaded successfully');
            setShowMap(true);
            
            // Try geocoding after map is loaded
            const geocodeAddress = async () => {
              try {
                const cleanAddress = address.trim();
                console.log('Geocoding address:', cleanAddress);
                
                const response = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${
                    encodeURIComponent(cleanAddress)
                  }.json?access_token=${mapboxToken}&country=GB&limit=1&types=address`
                );

                if (!response.ok) {
                  throw new Error(`Geocoding failed: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Geocoding response:', data);
                
                if (!data.features?.[0]?.center) {
                  throw new Error('No location found');
                }

                const coords: LngLatLike = data.features[0].center as [number, number];
                console.log('Found coordinates:', coords);

                // Update map center
                map.current?.setCenter(coords);

                // Add marker
                new mapboxgl.Marker({ color: '#7c3aed' })
                  .setLngLat(coords)
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                      .setHTML(`<div class="p-2"><strong>${address}</strong></div>`)
                  )
                  .addTo(map.current);

                setError(null);
              } catch (geocodeError) {
                console.error('Geocoding error:', geocodeError);
                setError('Could not find exact location, showing London center');
              }
            };

            geocodeAddress();
          });

          // Error handling
          map.current.on('error', (e) => {
            console.error('Mapbox error:', e);
            setError('Map loading error. Please try again later.');
          });

        } catch (mapInitError) {
          console.error('Map initialization error:', mapInitError);
          throw new Error('Failed to initialize map');
        }

      } catch (error) {
        console.error('Final error:', error);
        setError('Could not load map. Please try again later.');
        setShowMap(false);
      }
    };

    // Initialize map with a small delay to ensure container is ready
    const timeoutId = setTimeout(initializeMap, 100);

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
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <div 
        ref={mapContainer} 
        className="w-full h-[300px] rounded-lg bg-gray-50"
        style={{ 
          display: showMap ? 'block' : 'none'
        }} 
      />
      {!showMap && !error && (
        <div className="w-full h-[300px] rounded-lg flex items-center justify-center bg-gray-50">
          Loading map...
        </div>
      )}
    </Card>
  );
};
