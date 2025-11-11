import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockSupabaseClient, mockAuthUser } from '@/test/mocks/supabase.mock';

// Mock the supabase client BEFORE importing the service
vi.mock('@/lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}));

// Mock authService BEFORE importing the service
vi.mock('../authService', () => ({
  getAuthUser: vi.fn(),
}));

// Import after mocking
import {
  validateImageFile,
  uploadProfilePicture,
  uploadImage,
  deleteImage,
  storeGoogleProfilePicture,
  deleteProfilePicture,
  type Bucket,
} from '../storageService';

describe('storageService', () => {
  let mockSupabase: any;
  let mockGetAuthUser: any;

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase');
    const authService = await import('../authService');
    mockSupabase = supabase;
    mockGetAuthUser = authService.getAuthUser;
    vi.clearAllMocks();
  });

  describe('validateImageFile', () => {
    it('should validate a valid JPEG file', () => {
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid PNG file', () => {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid GIF file', () => {
      const file = new File(['dummy content'], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 500 * 1024 }); // 500KB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid WebP file', () => {
      const file = new File(['dummy content'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject file with invalid type', () => {
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only JPEG, PNG, GIF, and WebP images are allowed');
    });

    it('should reject file with invalid image type (SVG)', () => {
      const file = new File(['dummy content'], 'test.svg', { type: 'image/svg+xml' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only JPEG, PNG, GIF, and WebP images are allowed');
    });

    it('should reject file larger than 5MB', () => {
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Image must be less than 5MB');
    });

    it('should accept file exactly at 5MB limit', () => {
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // Exactly 5MB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept very small file (1KB)', () => {
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 }); // 1KB

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty file (0 bytes)', () => {
      const file = new File([], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 0 });

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('uploadProfilePicture', () => {

    it('should upload profile picture successfully', async () => {
      const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
      const userId = 'user-123';
      const expectedUrl = 'https://example.com/profile-pictures/user-123/12345.jpg';

      mockSupabase.mocks.upload.mockResolvedValue({ data: { path: 'user-123/12345.jpg' }, error: null });
      mockSupabase.mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } });

      const result = await uploadProfilePicture(file, userId);

      expect(result).toBe(expectedUrl);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('profile-pictures');
      expect(mockSupabase.mocks.upload).toHaveBeenCalledWith(
        expect.stringContaining('user-123/'),
        file,
        { cacheControl: '3600', upsert: true }
      );
    });

    it('should throw error when upload fails', async () => {
      const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' });
      const userId = 'user-123';
      const uploadError = new Error('Upload failed');

      mockSupabase.mocks.upload.mockResolvedValue({ data: null, error: uploadError });

      await expect(uploadProfilePicture(file, userId)).rejects.toThrow('Upload failed');
    });

    it('should handle different file extensions', async () => {
      const file = new File(['dummy content'], 'profile.png', { type: 'image/png' });
      const userId = 'user-456';
      const expectedUrl = 'https://example.com/profile-pictures/user-456/12345.png';

      mockSupabase.mocks.upload.mockResolvedValue({ data: { path: 'user-456/12345.png' }, error: null });
      mockSupabase.mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } });

      const result = await uploadProfilePicture(file, userId);

      expect(result).toBe(expectedUrl);
      expect(mockSupabase.mocks.upload).toHaveBeenCalledWith(
        expect.stringContaining('.png'),
        file,
        expect.any(Object)
      );
    });
  });

  describe('uploadImage', () => {

    it('should upload image to posts bucket by default', async () => {
      const file = new File(['dummy content'], 'post.jpg', { type: 'image/jpeg' });
      const expectedUrl = 'https://example.com/posts/test-user-id-123/12345.jpg';

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.upload.mockResolvedValue({ 
        data: { path: 'test-user-id-123/12345.jpg' }, 
        error: null 
      });
      mockSupabase.mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } });

      const result = await uploadImage(file);

      expect(result).toBe(expectedUrl);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('posts');
    });

    it('should upload image to specified bucket', async () => {
      const file = new File(['dummy content'], 'resource.jpg', { type: 'image/jpeg' });
      const bucket: Bucket = 'resources';
      const expectedUrl = 'https://example.com/resources/test-user-id-123/12345.jpg';

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.upload.mockResolvedValue({ 
        data: { path: 'test-user-id-123/12345.jpg' }, 
        error: null 
      });
      mockSupabase.mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } });

      const result = await uploadImage(file, bucket);

      expect(result).toBe(expectedUrl);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('resources');
    });

    it('should throw error when user is not authenticated', async () => {
      const file = new File(['dummy content'], 'post.jpg', { type: 'image/jpeg' });

      mockGetAuthUser.mockResolvedValue(null);

      await expect(uploadImage(file)).rejects.toThrow('Not authenticated');
    });

    it('should throw error when upload fails', async () => {
      const file = new File(['dummy content'], 'post.jpg', { type: 'image/jpeg' });
      const uploadError = new Error('Storage error');

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.upload.mockResolvedValue({ data: null, error: uploadError });

      await expect(uploadImage(file)).rejects.toThrow('Storage error');
    });
  });

  describe('deleteImage', () => {

    it('should delete image successfully', async () => {
      const url = 'https://example.com/posts/test-user-id-123/12345.jpg';

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.remove.mockResolvedValue({ data: null, error: null });

      await deleteImage(url);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('posts');
      expect(mockSupabase.mocks.remove).toHaveBeenCalledWith(['test-user-id-123/12345.jpg']);
    });

    it('should delete image from specified bucket', async () => {
      const url = 'https://example.com/resources/test-user-id-123/resource.png';
      const bucket: Bucket = 'resources';

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.remove.mockResolvedValue({ data: null, error: null });

      await deleteImage(url, bucket);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('resources');
      expect(mockSupabase.mocks.remove).toHaveBeenCalledWith(['test-user-id-123/resource.png']);
    });

    it('should throw error when user is not authenticated', async () => {
      const url = 'https://example.com/posts/test-user-id-123/12345.jpg';

      mockGetAuthUser.mockResolvedValue(null);

      await expect(deleteImage(url)).rejects.toThrow('Not authenticated');
    });

    it('should throw error when delete fails', async () => {
      const url = 'https://example.com/posts/test-user-id-123/12345.jpg';
      const deleteError = new Error('Delete failed');

      mockGetAuthUser.mockResolvedValue(mockAuthUser);
      mockSupabase.mocks.remove.mockResolvedValue({ data: null, error: deleteError });

      await expect(deleteImage(url)).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteProfilePicture', () => {

    it('should delete profile picture successfully', async () => {
      const userId = 'user-123';

      mockSupabase.mocks.remove.mockResolvedValue({ data: null, error: null });

      await deleteProfilePicture(userId);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('profile-pictures');
      expect(mockSupabase.mocks.remove).toHaveBeenCalledWith(['user-123-*']);
    });

    it('should throw error when delete fails', async () => {
      const userId = 'user-123';
      const deleteError = new Error('Delete failed');

      mockSupabase.mocks.remove.mockResolvedValue({ data: null, error: deleteError });

      await expect(deleteProfilePicture(userId)).rejects.toThrow('Delete failed');
    });
  });

  describe('storeGoogleProfilePicture', () => {
    let originalFetch: any;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should store Google profile picture successfully', async () => {
      const googleUrl = 'https://lh3.googleusercontent.com/a/test-image';
      const userId = 'user-123';
      const expectedUrl = 'https://example.com/profile-pictures/user-123/12345.jpg';

      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      mockSupabase.mocks.upload.mockResolvedValue({ data: { path: 'user-123/12345.jpg' }, error: null });
      mockSupabase.mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } });

      const result = await storeGoogleProfilePicture(googleUrl, userId);

      expect(result).toBe(expectedUrl);
      expect(global.fetch).toHaveBeenCalledWith(googleUrl);
      expect(mockSupabase.mocks.upload).toHaveBeenCalled();
    });

    it('should return null when fetch fails', async () => {
      const googleUrl = 'https://lh3.googleusercontent.com/a/test-image';
      const userId = 'user-123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await storeGoogleProfilePicture(googleUrl, userId);

      expect(result).toBeNull();
    });

    it('should return null when upload fails', async () => {
      const googleUrl = 'https://lh3.googleusercontent.com/a/test-image';
      const userId = 'user-123';

      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      mockSupabase.mocks.upload.mockResolvedValue({ 
        data: null, 
        error: new Error('Upload failed') 
      });

      const result = await storeGoogleProfilePicture(googleUrl, userId);

      expect(result).toBeNull();
    });
  });
});
