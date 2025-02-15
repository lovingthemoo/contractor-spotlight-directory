
import { PlaceDetails, PlacePhoto } from './types.ts';

export async function searchPlaces(term: string, apiKey: string): Promise<PlaceDetails[]> {
  const searchResponse = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(term)}&key=${apiKey}`
  );

  if (!searchResponse.ok) {
    console.error(`Failed to search places for term: ${term}`, await searchResponse.text());
    return [];
  }

  const searchData = await searchResponse.json();
  console.log(`Found ${searchData.results?.length || 0} results for term: ${term}`);
  
  const places: PlaceDetails[] = [];
  
  for (const place of searchData.results) {
    if (places.length >= 50) break;

    if (place.photos && place.photos.length > 0) {
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos&key=${apiKey}`
      );

      if (!detailsResponse.ok) {
        console.error(`Failed to get details for place: ${place.place_id}`, await detailsResponse.text());
        continue;
      }

      const detailsData = await detailsResponse.json();
      if (detailsData.result && detailsData.result.photos) {
        places.push({
          place_id: place.place_id,
          name: place.name,
          photos: detailsData.result.photos
        });
      }
    }
  }

  return places;
}

export async function downloadPhoto(photo: PlacePhoto, apiKey: string): Promise<Blob | null> {
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${apiKey}`;
  
  try {
    const imageResponse = await fetch(photoUrl);
    if (!imageResponse.ok) {
      console.error('Failed to fetch photo:', await imageResponse.text());
      return null;
    }
    return await imageResponse.blob();
  } catch (error) {
    console.error('Error downloading photo:', error);
    return null;
  }
}
