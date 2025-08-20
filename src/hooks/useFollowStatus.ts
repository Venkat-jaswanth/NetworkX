import { useState, useEffect } from 'react';
import { isFollowing } from '@/services/followsService';

export function useFollowStatus(userId: string) {
  const [following, setFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const status = await isFollowing(userId);
        setFollowing(status);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const updateFollowStatus = (newStatus: boolean) => {
    setFollowing(newStatus);
  };

  return { following, loading, updateFollowStatus };
}
