import { supabase } from '@/lib/supabase';

/**
 * Download and store Google profile picture in Supabase Storage
 * @param googleUrl - The Google profile picture URL
 * @param userId - The user ID
 * @returns The Supabase Storage URL or null if failed
 */
export async function storeGoogleProfilePicture(googleUrl: string, userId: string): Promise<string | null> {
  try {
    // Direct fetch - no CORS proxy needed since we're storing in Supabase
    const response = await fetch(googleUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status);
      alert("Failed to fetch image: " + response.status);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Create a file from the blob
    const file = new File([blob], `${userId}-google-profile.jpg`, { type: 'image/jpeg' });
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`; // Use userId as folder name
    
    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Failed to upload profile picture:', error);
      alert("Failed to upload profile picture: " + error.message);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    alert("Failed to store Google profile picture: " + error);
    return null;
  }
}

/**
 * Upload custom profile picture to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user ID
 * @returns The public URL of the uploaded image
 */
export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`; // Use userId as folder name
  
  const { error } = await supabase.storage
    .from('profile-pictures')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Failed to upload profile picture:', error);
    alert("Failed to upload profile picture: " + error.message);
    throw error;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete profile picture from Supabase Storage
 * @param userId - The user ID
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
  const { error } = await supabase.storage
    .from('profile-pictures')
    .remove([`${userId}-*`]);
  if (error) {
    throw error;
  }
} 