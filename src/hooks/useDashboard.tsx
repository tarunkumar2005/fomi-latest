"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { RangeOption, Workspace } from "@/types/dashboard";
import {
  fetchUserWorkspaces,
  createWorkspaceAction,
  updateWorkspaceAction,
  deleteWorkspaceAction,
} from "@/lib/workspace-actions";

// ===========================
// WORKSPACES
// ===========================

export const useWorkspaces = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      return await fetchUserWorkspaces();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (workspaces rarely change)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      return await createWorkspaceAction(name, description);
    },
    onSuccess: () => {
      // Invalidate workspaces query to refetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      updates,
    }: {
      workspaceId: string;
      updates: { name?: string; description?: string; plan?: "FREE" | "PRO" };
    }) => {
      return await updateWorkspaceAction(workspaceId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      return await deleteWorkspaceAction(workspaceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

// ===========================
// DASHBOARD ANALYTICS
// ===========================

export const useDashboardData = (
  workspaceId: string | undefined,
  range: RangeOption
) => {
  return useQuery({
    queryKey: ["dashboard", workspaceId, range],
    queryFn: async () => {
      const response = await axios.get("/api/dashboard/analytics", {
        params: { workspaceId, range },
      });
      return response.data;
    },
    enabled: !!workspaceId, // Only fetch when workspaceId exists
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
    refetchInterval: 1000 * 60 * 5, // 5 minutes instead of 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
    // Select only the data we need - this is memoized and prevents unnecessary re-renders
    select: (data) => ({
      overviewData: data?.overviewData,
      trendsChartData: data?.trendsChartData,
      audienceData: data?.audienceData,
      funnelData: data?.funnelData,
    }),
  });
};

// ===========================
// PAGINATED FORMS DATA
// ===========================

export const useWorkspaceFormsData = (
  workspaceId: string | undefined,
  page: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: ["forms", workspaceId, page, pageSize],
    queryFn: async () => {
      const response = await axios.get("/api/dashboard/forms", {
        params: { workspaceId, page, pageSize },
      });
      return response.data;
    },
    enabled: !!workspaceId, // Only fetch when workspaceId exists
    staleTime: 1000 * 30, // 30 seconds (forms change more frequently)
    placeholderData: (previousData) => previousData, // Smooth pagination transitions
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
