import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockAuthUser } from '@/test/mocks/supabase.mock';
import type { Follow } from '@/types/app.types';

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
  followUser,
  unfollowUser,
  isFollowing,
  getMutualFollowers,
  getFollowing,
  getFollowers,
  getFollowerCount,
  getFollowingCount,
} from '../followsService';

describe('followsService', () => {
  let mockSupabase: any;
  let mockGetAuthUser: any;

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase');
    const authService = await import('../authService');
    mockSupabase = supabase;
    mockGetAuthUser = authService.getAuthUser;
    vi.clearAllMocks();
    
    // Default: user is authenticated
    mockGetAuthUser.mockResolvedValue(mockAuthUser);
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      const followingId = 'user-to-follow-456';

      mockSupabase.mocks.insert.mockResolvedValue({ data: null, error: null });

      await followUser(followingId);

      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
      expect(mockSupabase.mocks.insert).toHaveBeenCalledWith({
        follower_id: mockAuthUser.id,
        following_id: followingId,
      });
    });

    it('should throw error when follow operation fails', async () => {
      const followingId = 'user-to-follow-456';
      const followError = new Error('Database error');

      mockSupabase.mocks.insert.mockResolvedValue({ data: null, error: followError });

      await expect(followUser(followingId)).rejects.toThrow('Database error');
    });

    it('should handle duplicate follow attempt', async () => {
      const followingId = 'user-to-follow-456';
      const duplicateError = { code: '23505', message: 'duplicate key value' };

      mockSupabase.mocks.insert.mockResolvedValue({ data: null, error: duplicateError });

      await expect(followUser(followingId)).rejects.toEqual(duplicateError);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const followingId = 'user-to-unfollow-456';

      mockSupabase.mocks.delete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      await unfollowUser(followingId);

      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
      expect(mockSupabase.mocks.delete).toHaveBeenCalled();
    });

    it('should throw error when unfollow operation fails', async () => {
      const followingId = 'user-to-unfollow-456';
      const unfollowError = new Error('Database error');

      mockSupabase.mocks.delete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: unfollowError }),
        }),
      });

      await expect(unfollowUser(followingId)).rejects.toThrow('Database error');
    });

    it('should handle unfollowing a user not currently followed', async () => {
      const followingId = 'user-not-followed-456';

      mockSupabase.mocks.delete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      await expect(unfollowUser(followingId)).resolves.not.toThrow();
    });
  });

  describe('isFollowing', () => {
    it('should return true when user is following', async () => {
      const followingId = 'user-456';
      const followData = { follower_id: mockAuthUser.id, following_id: followingId };

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: followData, error: null }),
          }),
        }),
      });

      const result = await isFollowing(followingId);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
    });

    it('should return false when user is not following (PGRST116 error)', async () => {
      const followingId = 'user-456';
      const notFoundError = { code: 'PGRST116', message: 'Not found' };

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: notFoundError }),
          }),
        }),
      });

      const result = await isFollowing(followingId);

      expect(result).toBe(false);
    });

    it('should throw error for non-PGRST116 errors', async () => {
      const followingId = 'user-456';
      const databaseError = new Error('Database connection failed');

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: databaseError }),
          }),
        }),
      });

      await expect(isFollowing(followingId)).rejects.toThrow('Database connection failed');
    });

    it('should return false when data is null but no error', async () => {
      const followingId = 'user-456';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const result = await isFollowing(followingId);

      expect(result).toBe(false);
    });
  });

  describe('getMutualFollowers', () => {
    it('should return mutual followers successfully', async () => {
      const otherUserId = 'user-456';
      const mutualFollows: Follow[] = [
        {
          follower_id: mockAuthUser.id,
          following_id: otherUserId,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          follower_id: otherUserId,
          following_id: mockAuthUser.id,
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockSupabase.mocks.select.mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mutualFollows, error: null }),
        }),
      });

      const result = await getMutualFollowers(otherUserId);

      expect(result).toEqual(mutualFollows);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
    });

    it('should return empty array when no mutual followers', async () => {
      const otherUserId = 'user-456';

      mockSupabase.mocks.select.mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getMutualFollowers(otherUserId);

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const otherUserId = 'user-456';
      const queryError = new Error('Query failed');

      mockSupabase.mocks.select.mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: queryError }),
        }),
      });

      await expect(getMutualFollowers(otherUserId)).rejects.toThrow('Query failed');
    });
  });

  describe('getFollowing', () => {
    it('should return list of users being followed', async () => {
      const followerId = 'user-123';
      const followingList: Follow[] = [
        {
          follower_id: followerId,
          following_id: 'user-456',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          follower_id: followerId,
          following_id: 'user-789',
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: followingList, error: null }),
        }),
      });

      const result = await getFollowing(followerId);

      expect(result).toEqual(followingList);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
      expect(mockSupabase.mocks.select).toHaveBeenCalledWith('*');
    });

    it('should return empty array when user follows no one', async () => {
      const followerId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getFollowing(followerId);

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const followerId = 'user-123';
      const queryError = new Error('Database error');

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: queryError }),
        }),
      });

      await expect(getFollowing(followerId)).rejects.toThrow('Database error');
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const followingId = 'user-123';
      const followersList: Follow[] = [
        {
          follower_id: 'user-456',
          following_id: followingId,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          follower_id: 'user-789',
          following_id: followingId,
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: followersList, error: null }),
        }),
      });

      const result = await getFollowers(followingId);

      expect(result).toEqual(followersList);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
    });

    it('should return empty array when user has no followers', async () => {
      const followingId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getFollowers(followingId);

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const followingId = 'user-123';
      const queryError = new Error('Database error');

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: queryError }),
        }),
      });

      await expect(getFollowers(followingId)).rejects.toThrow('Database error');
    });
  });

  describe('getFollowerCount', () => {
    it('should return correct follower count', async () => {
      const followingId = 'user-123';
      const count = 42;

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count, error: null }),
      });

      const result = await getFollowerCount(followingId);

      expect(result).toBe(count);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
      expect(mockSupabase.mocks.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should return 0 when user has no followers', async () => {
      const followingId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      });

      const result = await getFollowerCount(followingId);

      expect(result).toBe(0);
    });

    it('should return 0 when count is null', async () => {
      const followingId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: null }),
      });

      const result = await getFollowerCount(followingId);

      expect(result).toBe(0);
    });

    it('should throw error when query fails', async () => {
      const followingId = 'user-123';
      const queryError = new Error('Count query failed');

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: queryError }),
      });

      await expect(getFollowerCount(followingId)).rejects.toThrow('Count query failed');
    });

    it('should handle large follower counts', async () => {
      const followingId = 'user-123';
      const largeCount = 1000000;

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: largeCount, error: null }),
      });

      const result = await getFollowerCount(followingId);

      expect(result).toBe(largeCount);
    });
  });

  describe('getFollowingCount', () => {
    it('should return correct following count', async () => {
      const followerId = 'user-123';
      const count = 35;

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count, error: null }),
      });

      const result = await getFollowingCount(followerId);

      expect(result).toBe(count);
      expect(mockSupabase.from).toHaveBeenCalledWith('Follows');
      expect(mockSupabase.mocks.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should return 0 when user follows no one', async () => {
      const followerId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      });

      const result = await getFollowingCount(followerId);

      expect(result).toBe(0);
    });

    it('should return 0 when count is null', async () => {
      const followerId = 'user-123';

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: null }),
      });

      const result = await getFollowingCount(followerId);

      expect(result).toBe(0);
    });

    it('should throw error when query fails', async () => {
      const followerId = 'user-123';
      const queryError = new Error('Count query failed');

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: queryError }),
      });

      await expect(getFollowingCount(followerId)).rejects.toThrow('Count query failed');
    });

    it('should handle large following counts', async () => {
      const followerId = 'user-123';
      const largeCount = 5000;

      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: largeCount, error: null }),
      });

      const result = await getFollowingCount(followerId);

      expect(result).toBe(largeCount);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle following and then unfollowing the same user', async () => {
      const followingId = 'user-456';

      // Follow
      mockSupabase.mocks.insert.mockResolvedValue({ data: null, error: null });
      await followUser(followingId);

      // Unfollow
      mockSupabase.mocks.delete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });
      await unfollowUser(followingId);

      expect(mockSupabase.mocks.insert).toHaveBeenCalled();
      expect(mockSupabase.mocks.delete).toHaveBeenCalled();
    });

    it('should handle checking follow status after following', async () => {
      const followingId = 'user-456';

      // Follow
      mockSupabase.mocks.insert.mockResolvedValue({ data: null, error: null });
      await followUser(followingId);

      // Check status
      mockSupabase.mocks.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: { follower_id: mockAuthUser.id, following_id: followingId }, 
              error: null 
            }),
          }),
        }),
      });

      const isFollowingResult = await isFollowing(followingId);
      expect(isFollowingResult).toBe(true);
    });
  });
});
