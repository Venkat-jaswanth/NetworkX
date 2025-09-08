import { supabase } from '@/lib/supabase';
import type { Roadmap, RoadmapStep } from '@/types/app.types';

export async function listRoadmaps(): Promise<Roadmap[]> {
  const { data, error } = await supabase
    .from('Roadmaps')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRoadmapWithSteps(roadmapId: string): Promise<{ roadmap: Roadmap, steps: RoadmapStep[] }>{
  const [{ data: roadmap, error: rErr }, { data: steps, error: sErr }] = await Promise.all([
    supabase.from('Roadmaps').select('*').eq('id', roadmapId).single(),
    supabase.from('RoadmapSteps').select('*').eq('roadmap_id', roadmapId).order('step_index', { ascending: true })
  ]);
  if (rErr) throw rErr;
  if (sErr) throw sErr;
  return { roadmap: roadmap!, steps: steps || [] };
}

