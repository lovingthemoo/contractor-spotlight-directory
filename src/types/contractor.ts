
export interface GooglePhoto {
  url: string;
  width: number;
  height: number;
  type: string;
}

export interface GoogleReview {
  rating: number;
  text: string;
  time: string;
  author_name: string;
}

export interface Contractor {
  id: string;
  business_name: string;
  images: string[];
  rating: number;
  review_count: number;
  specialty: string;
  location: string;
  description: string;
  slug: string;
  project_types?: string[];
  typical_project_size?: string;
  minimum_project_value?: number;
  maximum_project_value?: number;
  google_place_name?: string;
  google_formatted_address?: string;
  google_formatted_phone?: string;
  website_description?: string;
  founded_year?: number;
  years_in_business?: number;
  google_reviews?: GoogleReview[];
  google_photos?: GooglePhoto[];
  phone?: string;     // Added this field
  email?: string;     // Added this field
  website_url?: string; // Added this field
}

export interface DatabaseContractor extends Omit<Contractor, 'google_reviews' | 'google_photos'> {
  google_reviews?: any;
  google_photos?: any;
}
