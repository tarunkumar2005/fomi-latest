import { authClient } from "@/lib/auth-client";
import { useQuery } from '@tanstack/react-query';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const session = await authClient.getSession(); // fetch session once
      return session;
    },
    staleTime: 5000,      // 5s cache freshness
    refetchInterval: 1000, // fetch every second for real-time
    retry: 2,             // retry twice on failure
    refetchOnWindowFocus: true, // refetch when user returns to tab
  });
};

export const signOut = async () => {
  await authClient.signOut();
};