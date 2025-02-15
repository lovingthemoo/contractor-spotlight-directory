
export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';
  private retryAttempts = 2; // Reduced from 3
  private retryDelay = 500; // Reduced from 1000ms
  private timeout = 5000; // 5 second timeout

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

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
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
          const delay = this.retryDelay;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  async testApiConnection(): Promise<boolean> {
    console.log('Starting API connection test');
    const testSearchBody = {
      textQuery: "construction company London",
      maxResultCount: 1,
      languageCode: "en"
    };

    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id,places.displayName'),
        body: JSON.stringify(testSearchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Places API test failed: ${response.status} ${errorText}`);
      }

      console.log('API test successful');
      return true;
    });
  }

  async searchPlaces(searchQuery: string, location: string): Promise<any[]> {
    console.log('Starting place search', { searchQuery, location });
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
      const response = await this.fetchWithTimeout(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount'),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
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
    console.log('Starting place details fetch', { placeId });
    return this.retryRequest(async () => {
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

      const response = await this.fetchWithTimeout(`${this.baseUrl}/${placeId}`, {
        method: 'GET',
        headers: this.getHeaders(fieldMask)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch place details: ${response.status} ${errorText}`);
      }

      const placeDetails = await response.json();
      console.log('Got place details, processing photos...');
      
      // Process photos if they exist
      if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
        // Process photos in batches of 2 to avoid overwhelming the API
        const batchSize = 2;
        const processedPhotos = [];
        
        for (let i = 0; i < placeDetails.photos.length; i += batchSize) {
          const batch = placeDetails.photos.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(async (photo: any, index: number) => {
            try {
              if (!photo.name) {
                return null;
              }

              const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${this.apiKey}`;
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
          
          processedPhotos.push(...batchResults.filter(Boolean));
          
          // Small delay between batches
          if (i + batchSize < placeDetails.photos.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        placeDetails.photos = processedPhotos;
        console.log(`Successfully processed ${processedPhotos.length} photos`);
      } else {
        placeDetails.photos = [];
      }
      
      return placeDetails;
    });
  }
}
