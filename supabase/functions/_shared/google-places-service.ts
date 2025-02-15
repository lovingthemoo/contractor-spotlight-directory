
export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

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

  private async retryRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${this.retryAttempts}`);
        return await requestFn();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error as Error;
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * attempt;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  async testApiConnection(): Promise<boolean> {
    const testSearchBody = {
      textQuery: "construction company London",
      maxResultCount: 1,
      languageCode: "en"
    };

    return this.retryRequest(async () => {
      console.log('Testing API connection...');
      const response = await fetch(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id,places.displayName'),
        body: JSON.stringify(testSearchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API test failed:', errorText);
        throw new Error(`Google Places API test failed: ${response.status} ${errorText}`);
      }

      console.log('API test successful');
      return true;
    });
  }

  async searchPlaces(searchQuery: string, location: string): Promise<any[]> {
    const searchBody = {
      textQuery: `${searchQuery} in ${location}`,
      maxResultCount: 5,
      locationBias: {
        circle: {
          center: {
            latitude: 51.5074,
            longitude: -0.1278
          },
          radius: 30000.0
        }
      },
      languageCode: "en"
    };

    return this.retryRequest(async () => {
      console.log('Searching places:', searchBody);
      const response = await fetch(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount'),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search failed:', errorText);
        throw new Error(`Places search failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Search results:', {
        query: searchQuery,
        location: location,
        resultsCount: data.places?.length || 0
      });
      
      return data.places || [];
    });
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    return this.retryRequest(async () => {
      console.log(`Fetching details for place: ${placeId}`);
      
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
        'internationalPhoneNumber'
      ].join(',');

      const response = await fetch(`${this.baseUrl}/${placeId}`, {
        method: 'GET',
        headers: this.getHeaders(fieldMask)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Place details error:', errorText);
        throw new Error(`Failed to fetch place details: ${response.status} ${errorText}`);
      }

      const placeDetails = await response.json();
      
      // Process photos if they exist
      if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
        placeDetails.photos = await Promise.all(placeDetails.photos.map(async (photo: any, index: number) => {
          try {
            if (!photo.name) {
              console.warn(`Photo ${index} missing name`);
              return null;
            }

            // Test the photo URL before returning it
            const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${this.apiKey}`;
            const photoResponse = await fetch(photoUrl, { method: 'HEAD' });
            
            if (!photoResponse.ok) {
              console.warn(`Photo URL ${index} is not accessible:`, photoResponse.status);
              return null;
            }

            return {
              name: photo.name,
              width: photo.widthPx || 800,
              height: photo.heightPx || 600,
              attribution: photo.authorAttributions?.[0]?.displayName || null,
              url: photoUrl
            };
          } catch (error) {
            console.error(`Error processing photo ${index}:`, error);
            return null;
          }
        }));

        placeDetails.photos = placeDetails.photos.filter(Boolean);
        console.log(`Successfully processed ${placeDetails.photos.length} photos`);
      } else {
        placeDetails.photos = [];
      }
      
      return placeDetails;
    });
  }
}
