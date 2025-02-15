
export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';
  private timeout = 5000; // 5 seconds timeout

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

  async testApiConnection(): Promise<boolean> {
    console.log('Starting API connection test');
    const testSearchBody = {
      textQuery: "construction company London",
      maxResultCount: 1,
      languageCode: "en"
    };

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id'),
        body: JSON.stringify(testSearchBody)
      });

      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }

      console.log('API test successful');
      return true;
    } catch (error) {
      console.error('API test error:', error);
      throw error;
    }
  }

  async searchPlaces(searchQuery: string, location: string): Promise<any[]> {
    console.log('Searching places:', { searchQuery, location });
    const searchBody = {
      textQuery: `${searchQuery} in ${location}`,
      maxResultCount: 3, // Reduced from 5
      languageCode: "en"
    };

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}:searchText`, {
        method: 'POST',
        headers: this.getHeaders('places.id,places.displayName,places.formattedAddress'),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.places || [];
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    console.log('Fetching place details:', placeId);
    
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/${placeId}`, {
        method: 'GET',
        headers: this.getHeaders('id,displayName,formattedAddress,rating,userRatingCount,websiteUri')
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Details error:', error);
      throw error;
    }
  }
}
