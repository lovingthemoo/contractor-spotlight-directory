
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
      console.log('InitializeMap function called');
      
      try {
        // Ensure any existing map is cleaned up
        if (map.current) {
          console.log('Cleaning up existing map instance');
          map.current.remove();
          map.current = null;
        }

        // Initialize with default London coordinates
        const defaultCoords: LngLatLike = [-0.1276, 51.5072];
        
        // Initialize Mapbox with access token
        console.log('Setting Mapbox access token');
        mapboxgl.accessToken = mapboxToken;

        // Configure Mapbox to use basic tiles without WebGL
        (mapboxgl as any).prewarm = false;
        (mapboxgl as any).clearStorage = true;
        (mapboxgl as any).baseApiUrl = 'https://api.mapbox.com';
        (mapboxgl as any).workerCount = 0;

        // Try to create map with minimal configuration
        try {
          console.log('Creating map with minimal config');
          
          if (!mapContainer.current) {
            throw new Error('Map container reference is not available');
          }

          const mapOptions = {
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: defaultCoords,
            zoom: 15,
            interactive: false,
            fadeDuration: 0,
            crossSourceCollisions: false,
            locale: { 'NavigationControl.ZoomIn': 'Zoom in', 'NavigationControl.ZoomOut': 'Zoom out' },
            optimizeForTerrain: false,
            preserveDrawingBuffer: false,
            refreshExpiredTiles: false,
            trackResize: false,
            boxZoom: false,
            dragRotate: false,
            dragPan: false,
            keyboard: false,
            doubleClickZoom: false,
            touchZoomRotate: false,
            maxBounds: null,
            renderWorldCopies: false,
            antialias: false
          };

          console.log('Map initialization options:', mapOptions);

          // Create map instance
          map.current = new mapboxgl.Map(mapOptions);
          console.log('Map instance created');

          // Once map is loaded
          map.current.once('load', () => {
            console.log('Map loaded event fired');
            setShowMap(true);
            
            // Handle geocoding
            const geocodeAddress = async () => {
              try {
                const cleanAddress = address.trim();
                console.log('Geocoding:', cleanAddress);
                
                const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
                  encodeURIComponent(cleanAddress)
                }.json?access_token=${mapboxToken}&country=GB&limit=1&types=address`;

                const response = await fetch(geocodingUrl);
                
                if (!response.ok) {
                  throw new Error(`Geocoding failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.features?.[0]?.center) {
                  throw new Error('No location found');
                }

                const coords = data.features[0].center as LngLatLike;
                console.log('Found coordinates:', coords);

                if (map.current) {
                  map.current.setCenter(coords);
                  
                  // Add a simple marker
                  new mapboxgl.Marker()
                    .setLngLat(coords)
                    .addTo(map.current);
                }

                setError(null);
              } catch (geocodeError) {
                console.error('Geocoding failed:', geocodeError);
                setError('Could not find exact location');
              }
            };

            geocodeAddress();
          });

          // Handle errors
          map.current.on('error', (e) => {
            console.error('Map error:', e.error);
            setError('Map loading error');
          });

        } catch (mapError) {
          console.error('Map creation failed:', mapError);
          throw mapError;
        }

      } catch (finalError) {
        console.error('Final error:', finalError);
        setError('Could not load map');
        setShowMap(false);
      }
    };

    // Start initialization
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup
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
