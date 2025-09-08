import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUnreadNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  getBadgeCounts 
} from '@/services/notificationService';
import { useAuthQuery } from './useAuthQuery';

export const useNotificationsQuery = () => {
  const { data: user } = useAuthQuery();
  
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: getUnreadNotifications,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUnreadCountQuery = () => {
  const { data: user } = useAuthQuery();
  
  return useQuery({
    queryKey: ['notifications', 'count', user?.id],
    queryFn: getUnreadCount,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useBadgeCountsQuery = () => {
  const { data: user } = useAuthQuery();
  
  return useQuery({
    queryKey: ['badges', user?.id],
    queryFn: getBadgeCounts,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
