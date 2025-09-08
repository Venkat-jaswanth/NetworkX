import { supabase } from '@/lib/supabase';
import { getAuthUser } from './authService';

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

// Generic image upload for posts, resources, etc.
export async function uploadImage(file: File, bucket: 'profile-pictures' | 'posts' | 'resources' = 'posts'): Promise<string> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteImage(url: string, bucket: 'profile-pictures' | 'posts' | 'resources' = 'posts'): Promise<void> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  // Extract path from URL
  const urlParts = url.split('/');
  const path = urlParts.slice(-2).join('/'); // user_id/filename

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

// Helper to validate image files
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }

  return { valid: true };
}