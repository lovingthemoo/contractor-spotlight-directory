
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

        console.log('Configuring Mapbox settings');
        // Force disable WebGL to avoid worker issues
        console.log('Current Mapbox worker count:', (mapboxgl as any).workerCount);
        console.log('Current Mapbox API URL:', (mapboxgl as any).baseApiUrl);
        
        (mapboxgl as any).baseApiUrl = 'https://api.mapbox.com';
        (mapboxgl as any).workerCount = 0;
        
        console.log('Updated Mapbox settings:', {
          workerCount: (mapboxgl as any).workerCount,
          baseApiUrl: (mapboxgl as any).baseApiUrl
        });

        // Try to create map with basic configuration and fallbacks
        try {
          console.log('Attempting to create map instance');
          
          if (!mapContainer.current) {
            throw new Error('Map container reference is not available');
          }

          const mapOptions = {
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/basic-v9',
            center: defaultCoords,
            zoom: 15,
            minZoom: 9,
            maxZoom: 17,
            interactive: false,
            preserveDrawingBuffer: false,
            antialias: false,
            trackResize: false,
            attributionControl: true
          };

          console.log('Map initialization options:', mapOptions);

          map.current = new mapboxgl.Map(mapOptions);
          console.log('Map instance created successfully');

          // Set up loading handlers
          map.current.once('load', () => {
            console.log('Map load event triggered');
            setShowMap(true);
            
            // Try geocoding after map is loaded
            const geocodeAddress = async () => {
              console.log('Starting geocoding process');
              try {
                const cleanAddress = address.trim();
                console.log('Geocoding address:', cleanAddress);
                
                const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
                  encodeURIComponent(cleanAddress)
                }.json?access_token=${mapboxToken}&country=GB&limit=1&types=address`;
                
                console.log('Geocoding URL:', geocodingUrl.replace(mapboxToken, '[REDACTED]'));

                const response = await fetch(geocodingUrl);
                console.log('Geocoding response status:', response.status);

                if (!response.ok) {
                  throw new Error(`Geocoding failed: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Geocoding response data:', data);
                
                if (!data.features?.[0]?.center) {
                  throw new Error('No location found in geocoding response');
                }

                const coords: LngLatLike = data.features[0].center as [number, number];
                console.log('Found coordinates:', coords);

                if (!map.current) {
                  throw new Error('Map instance lost during geocoding');
                }

                // Update map center
                console.log('Updating map center');
                map.current.setCenter(coords);

                // Add marker
                console.log('Adding marker to map');
                new mapboxgl.Marker({ color: '#7c3aed' })
                  .setLngLat(coords)
                  .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                      .setHTML(`<div class="p-2"><strong>${address}</strong></div>`)
                  )
                  .addTo(map.current);

                console.log('Marker added successfully');
                setError(null);
              } catch (geocodeError) {
                console.error('Detailed geocoding error:', {
                  error: geocodeError,
                  message: geocodeError.message,
                  stack: geocodeError.stack
                });
                setError('Could not find exact location, showing London center');
              }
            };

            geocodeAddress();
          });

          // Error handling
          map.current.on('error', (e) => {
            console.error('Detailed Mapbox error:', {
              error: e,
              message: e.error?.message || 'Unknown error',
              stack: e.error?.stack,
              target: e.target,
              type: e.type
            });
            setError('Map loading error. Please try again later.');
          });

        } catch (mapInitError) {
          console.error('Detailed map initialization error:', {
            error: mapInitError,
            message: mapInitError.message,
            stack: mapInitError.stack,
            type: mapInitError.constructor.name
          });
          throw new Error('Failed to initialize map');
        }

      } catch (error) {
        console.error('Final detailed error:', {
          error,
          message: error.message,
          stack: error.stack,
          type: error.constructor.name
        });
        setError('Could not load map. Please try again later.');
        setShowMap(false);
      }
    };

    // Initialize map with a small delay to ensure container is ready
    console.log('Setting timeout for map initialization');
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      console.log('Cleaning up map component');
      clearTimeout(timeoutId);
      if (map.current) {
        console.log('Removing map instance');
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
