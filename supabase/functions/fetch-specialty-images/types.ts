
export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions: string[];
}

export interface PlaceDetails {
  place_id: string;
  photos?: PlacePhoto[];
  name: string;
}

export interface SearchTerms {
  [key: string]: string[];
}

export const searchTerms: SearchTerms = {
  'Electrical': ['electrician business UK', 'electrical contractor UK', 'electrical works UK'],
  'Plumbing': ['plumber business UK', 'plumbing contractor UK', 'plumbing works UK'],
  'Roofing': ['roofing contractor UK', 'roof repair UK', 'roofing company UK'],
  'Building': ['building contractor UK', 'construction company UK', 'builder UK'],
  'Home Repair': ['home repair contractor UK', 'property maintenance UK', 'home improvement UK'],
  'Gardening': ['gardening service UK', 'landscape contractor UK', 'garden maintenance UK'],
  'Construction': ['construction site UK', 'building construction UK', 'construction company UK'],
  'Handyman': ['handyman service UK', 'property maintenance UK', 'home repair UK']
};
