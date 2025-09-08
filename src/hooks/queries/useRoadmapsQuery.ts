import { useQuery } from '@tanstack/react-query';
import { listRoadmaps, getRoadmapWithSteps } from '@/services/roadmapsService';

export const useRoadmapsQuery = () => {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => listRoadmaps(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useRoadmapDetailQuery = (roadmapId: string | null) => {
  return useQuery({
    queryKey: ['roadmap', roadmapId],
    queryFn: () => getRoadmapWithSteps(roadmapId!),
    enabled: !!roadmapId,
    staleTime: 10 * 60 * 1000,
  });
};

