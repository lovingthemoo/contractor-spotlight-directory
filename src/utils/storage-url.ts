
export const getStorageUrl = (path: string): string => {
  // If path is empty or null, return placeholder
  if (!path) {
    console.debug('Empty path provided, using placeholder');
    return '/placeholder.svg';
  }

  // If it's already a full URL (e.g. https://...), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If it's a storage URL that already includes the full path, return as is
  if (path.includes('storage/v1/object/public')) {
    return path;
  }
  
  // For google photos URLs, return as is
  if (path.startsWith('photos/')) {
    return path;
  }
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the full storage URL
  const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${cleanPath}`;
  console.debug('Constructed storage URL:', {
    originalPath: path,
    cleanPath,
    storageUrl,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL
  });
  return storageUrl;
};
