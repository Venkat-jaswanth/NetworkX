import { useQuery } from '@tanstack/react-query';
import { listResources, getNewResourcesCount, markResourcesSeen } from '@/services/resourcesService';
import type { ResourceFilters } from '@/types/app.types';

export const useResourcesQuery = (filters: ResourceFilters) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => listResources(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useNewResourcesCount = () => {
  return useQuery({
    queryKey: ['resources', 'count'],
    queryFn: () => getNewResourcesCount(),
    staleTime: 30 * 1000,
  });
};

export const useMarkResourcesSeen = () => {
  // convenience function to mark as seen; used on mount in pages
  return markResourcesSeen;
};

