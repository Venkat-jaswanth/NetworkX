import { useQuery } from '@tanstack/react-query';
import { listOpportunities, getNewOpportunitiesCount, markOpportunitiesSeen } from '@/services/opportunitiesService';
import type { OpportunityFilters } from '@/types/app.types';

export const useOpportunitiesQuery = (filters: OpportunityFilters) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => listOpportunities(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useNewOpportunitiesCount = () => {
  return useQuery({
    queryKey: ['opportunities', 'count'],
    queryFn: () => getNewOpportunitiesCount(),
    staleTime: 30 * 1000,
  });
};

export const useMarkOpportunitiesSeen = () => {
  return markOpportunitiesSeen;
};

