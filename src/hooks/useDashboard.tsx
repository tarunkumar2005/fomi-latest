"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { RangeOption, Workspace, Plan } from "@/types/dashboard";

// ===========================
// WORKSPACES (Temporary Mock Data)
// ===========================

// TODO: Replace with API call to fetch user's workspaces
const getWorkspaces = (): Workspace[] => {
  return [
    {
      id: "demo_workspace_001",
      name: "Acme Corp",
      slug: "acme-corp",
      description: "Workspace for Acme Corporation",
      plan: Plan.FREE,
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2023-06-20T12:00:00Z",
    },
    {
      id: "workspace-2",
      name: "Beta LLC",
      slug: "beta-llc",
      description: "Workspace for Beta LLC",
      plan: Plan.PRO,
      createdAt: "2022-11-05T14:30:00Z",
      updatedAt: "2023-05-18T09:15:00Z",
    },
    {
      id: "workspace-3",
      name: "Gamma Inc",
      slug: "gamma-inc",
      description: "Workspace for Gamma Inc",
      plan: Plan.FREE,
      createdAt: "2023-02-10T11:00:00Z",
      updatedAt: "2023-06-15T08:30:00Z",
    },
  ];
};

export const useWorkspaces = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      // TODO: Replace with real API call when ready
      // const response = await axios.get('/api/workspaces');
      // return response.data;

      // For now, return mock data
      return getWorkspaces();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (workspaces rarely change)
    refetchOnWindowFocus: false,
    retry: 1,
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
