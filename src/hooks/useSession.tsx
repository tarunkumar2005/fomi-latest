import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const session = await authClient.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - session data rarely changes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when internet reconnects
    retry: 2, // Retry twice on failure
  });
};

export const signOut = async () => {
  await authClient.signOut();
};
