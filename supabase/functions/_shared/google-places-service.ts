
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
      languageCode: "en"
    };

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
    return data.places || [];
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log(`Fetching details for place: ${placeId}`);
      
      // Request all photo-related fields
      const fieldMask = [
        'id',
        'displayName',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'websiteUri',
        'types',
        'editorialSummary',
        'googleMapsUri',
        'internationalPhoneNumber',
        'reviews',
        'photos',  // Request all photo fields
        'regularOpeningHours'
      ].join(',');

      console.log('Using field mask:', fieldMask);
      console.log('Making request to:', `${this.baseUrl}/${placeId}`);

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
      
      console.log('Raw place details response:', {
        id: placeDetails.id,
        name: placeDetails.displayName?.text,
        hasPhotosField: 'photos' in placeDetails,
        photosIsArray: Array.isArray(placeDetails.photos),
        photosLength: placeDetails.photos?.length,
        firstPhoto: placeDetails.photos?.[0]
      });

      // Transform photos to use the format similar to the provided examples
      if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
        placeDetails.photos = placeDetails.photos.map((photo: any) => {
          if (!photo.name) {
            console.log('Photo missing name:', photo);
            return null;
          }
          
          console.log('Processing photo:', photo);
          
          const photoRef = photo.name.split('/').pop();
          if (!photoRef) {
            console.log('Invalid photo reference:', photo.name);
            return null;
          }

          // Extract the unique photo ID
          const photoId = photoRef.replace('places/', '');
          
          // Calculate aspect ratio to determine dimensions
          const width = photo.widthPx || 800;
          const height = photo.heightPx || 600;
          const aspectRatio = width / height;
          
          console.log('Photo dimensions:', {
            width,
            height,
            aspectRatio,
            photoId
          });
          
          let dimensions;
          if (Math.abs(aspectRatio - 1) < 0.1) {
            // Square-ish image
            dimensions = 'w231-h231';
          } else {
            // Rectangular image
            dimensions = 'w231-h165';
          }
          
          const url = `https://lh5.googleusercontent.com/p/${photoId}=${dimensions}-n-k-no-nu`;
          console.log('Generated photo URL:', url);
          
          return {
            ...photo,
            url
          };
        }).filter(Boolean); // Remove any null entries

      } else {
        console.log('No photos array in place details:', placeDetails);
      }
      
      return placeDetails;
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      throw error;
    }
  }
}
