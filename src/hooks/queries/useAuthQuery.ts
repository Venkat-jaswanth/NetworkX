import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const authQueryOptions = {
  queryKey: ['auth', 'user'],
  queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  staleTime: Infinity, // Auth state doesn't go stale
  gcTime: Infinity, // Never garbage collect auth
};

export const useAuthQuery = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Set auth state directly when auth state changes
      queryClient.setQueryData(['auth', 'user'], session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery(authQueryOptions);
}; 