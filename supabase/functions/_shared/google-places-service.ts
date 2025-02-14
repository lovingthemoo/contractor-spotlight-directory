
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
      
      // Include reviews and photos in the field mask
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
        'photos'
      ].join(',');

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
      console.log('Successfully fetched place details:', {
        id: placeDetails.id,
        name: placeDetails.displayName?.text,
        address: placeDetails.formattedAddress,
        hasReviews: Array.isArray(placeDetails.reviews),
        reviewCount: placeDetails.reviews?.length || 0,
        hasPhotos: Array.isArray(placeDetails.photos),
        photoCount: placeDetails.photos?.length || 0
      });
      
      return placeDetails;
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      throw error;
    }
  }
}
