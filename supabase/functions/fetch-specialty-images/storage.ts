
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PlaceDetails } from './types.ts';

export async function setupStorage(supabase: ReturnType<typeof createClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();

  if (!buckets?.find(b => b.name === 'contractor-images')) {
    console.log('Creating contractor-images bucket');
    const { error: bucketError } = await supabase
      .storage
      .createBucket('contractor-images', { public: true });
    
    if (bucketError) {
      console.error('Error creating bucket:', bucketError);
      throw bucketError;
    }
  }
}

export async function storeImage(
  supabase: ReturnType<typeof createClient>,
  specialty: string,
  place: PlaceDetails,
  imageBlob: Blob
): Promise<string | null> {
  const fileName = `specialty/${specialty.toLowerCase()}/${place.place_id}-${crypto.randomUUID()}.jpg`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('contractor-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('contractor-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function storeImageMetadata(
  supabase: ReturnType<typeof createClient>,
  specialty: string,
  place: PlaceDetails,
  publicUrl: string
): Promise<boolean> {
  const { error: insertError } = await supabase
    .from('specialty_default_images')
    .insert({
      specialty,
      image_url: publicUrl,
      source: 'google',
      google_place_id: place.place_id,
      image_alt: `${specialty} work by ${place.name}`,
      last_updated: new Date().toISOString()
    });

  if (insertError) {
    console.error('Error inserting image record:', insertError);
    return false;
  }

  return true;
}
