
export interface PlaceSearchResult {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
}

export interface ContractorData {
  business_name: string;
  google_place_id: string;
  google_place_name: string;
  google_formatted_address: string;
  google_formatted_phone?: string;
  location: string;
  rating?: number;
  review_count?: number;
  specialty: string;
  google_reviews?: any[];
  google_photos?: any[];
  website_url?: string;
  opening_hours?: any;
  google_business_scopes?: string[];
  needs_google_enrichment: boolean;
  last_enrichment_attempt: string;
  description?: string;
  website_description?: string;
  slug: string;
}
