
import { PlaceSearchResult } from './types.ts';

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(fieldMask: string) {
    return {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': fieldMask
    };
  }

  async testApiConnection(): Promise<boolean> {
    const testSearchBody = {
      textQuery: "construction company London",
      maxResultCount: 5,
      languageCode: "en"
    };

    const response = await fetch(`${this.baseUrl}:searchText`, {
      method: 'POST',
      headers: this.getHeaders('places.id,places.displayName,places.formattedAddress'),
      body: JSON.stringify(testSearchBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Places API test failed: ${response.status} ${errorText}`);
    }

    return true;
  }

  async searchPlaces(searchQuery: string, location: string): Promise<PlaceSearchResult[]> {
    const searchBody = {
      textQuery: `${searchQuery} in ${location}`,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: {
            latitude: 51.5074,  // London's latitude
            longitude: -0.1278  // London's longitude
          },
          radius: 30000.0  // 30km radius
        }
      },
      languageCode: "en"
    };

    console.log('Search request:', searchBody);

    const response = await fetch(`${this.baseUrl}:searchText`, {
      method: 'POST',
      headers: this.getHeaders('places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types'),
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search failed:', { query: searchQuery, location, status: response.status, error: errorText });
      return [];
    }

    const data = await response.json();
    console.log('Search response:', {
      query: searchQuery,
      location: location,
      placesFound: data.places?.length || 0
    });
    
    return data.places || [];
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log(`Fetching details for place: ${placeId}`);
      
      // Updated field mask to include all necessary photo metadata
      const fieldMask = [
        'id',
        'displayName',
        'formattedAddress',
        'photos',
        'rating',
        'userRatingCount',
        'websiteUri',
        'types',
        'editorialSummary',
        'googleMapsUri',
        'internationalPhoneNumber'
      ].join(',');

      console.log('Using field mask:', fieldMask);

      const response = await fetch(`${this.baseUrl}/${placeId}`, {
        method: 'GET',
        headers: this.getHeaders(fieldMask)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Place details error: ${response.status}`, errorText);
        throw new Error(`Failed to fetch place details: ${response.status}`);
      }

      const placeDetails = await response.json();
      
      // Log the entire raw response for debugging
      console.log('Raw place details:', JSON.stringify(placeDetails, null, 2));
      
      // Process photos if they exist
      if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
        console.log(`Found ${placeDetails.photos.length} photos for place ${placeId}`);
        
        placeDetails.photos = placeDetails.photos.map((photo: any, index: number) => {
          console.log(`Processing photo ${index}:`, photo);
          
          if (!photo.name) {
            console.error(`Photo ${index} missing name:`, photo);
            return null;
          }

          try {
            // Extract the last part of the name which contains the photo reference
            const photoRef = photo.name.split('/').pop();
            if (!photoRef) {
              console.error(`Invalid photo reference for photo ${index}:`, photo.name);
              return null;
            }

            // Remove 'places/' prefix if present
            const photoId = photoRef.replace(/^places\//, '');

            // Use appropriate dimensions for each URL
            const previewUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=231&maxWidthPx=231&key=${this.apiKey}`;
            const fullUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${this.apiKey}`;

            console.log(`Generated URLs for photo ${index}:`, {
              photoId,
              hasPreviewUrl: !!previewUrl,
              hasFullUrl: !!fullUrl
            });

            return {
              id: photoId,
              name: photo.name,
              width: photo.widthPx || 800,
              height: photo.heightPx || 600,
              previewUrl,
              fullUrl,
              attribution: photo.authorAttributions?.[0]?.displayName || null
            };
          } catch (error) {
            console.error(`Error processing photo ${index}:`, error);
            return null;
          }
        }).filter(Boolean); // Remove any null entries

        console.log('Processed photos:', {
          totalPhotos: placeDetails.photos.length,
          samplePhoto: placeDetails.photos[0]
        });
      } else {
        console.log('No photos found in place details');
        placeDetails.photos = [];
      }
      
      return placeDetails;
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      throw error;
    }
  }
}
