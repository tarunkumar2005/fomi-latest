"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import Overview from "@/components/dashboard/overview";
import EngagementTrends from "@/components/dashboard/engagement";
import Audience from "@/components/dashboard/audiance";
import FunnelAnalysis from "@/components/dashboard/funnel-analysis";
import FormPaginated from "@/components/dashboard/form-paginated";
import AIInsights from "@/components/dashboard/ai-insights";
import {
  useWorkspaces,
  useDashboardData,
  useWorkspaceFormsData,
} from "@/hooks/useDashboard";
import { RangeOption, Workspace } from "@/types/dashboard";

export default function DashboardPageClient() {
  // Get workspaces
  const { data: workspaces = [], isLoading: isLoadingWorkspaces } =
    useWorkspaces();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [range, setRange] = useState<RangeOption>(RangeOption["24h"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Initialize activeWorkspace once workspaces are loaded
  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace]);

  // Fetch dashboard data with TanStack Query (data is already memoized via select)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    error: dashboardError,
  } = useDashboardData(activeWorkspace?.id, range);

  // Fetch forms data with TanStack Query
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: formsError,
  } = useWorkspaceFormsData(activeWorkspace?.id, currentPage, pageSize);

  // Show loading state while workspaces are loading
  if (isLoadingWorkspaces) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if workspaces failed to load
  if (!workspaces.length && !isLoadingWorkspaces) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No workspaces found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please create a workspace to continue
          </p>
        </div>
      </div>
    );
  }

  // Don't render until we have an active workspace
  if (!activeWorkspace) {
    return null;
  }

  return (
    <>
      <Header
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
      />
      <Overview
        range={range}
        setRange={setRange}
        overviewData={dashboardData?.overviewData}
        isLoading={isDashboardLoading}
        isFetching={isDashboardFetching}
      />
      <EngagementTrends
        range={range}
        isLoading={isDashboardLoading}
        trendsChartData={dashboardData?.trendsChartData}
      />
      <Audience
        isLoading={isDashboardLoading}
        audienceData={dashboardData?.audienceData}
      />
      <FunnelAnalysis
        isLoading={isDashboardLoading}
        funnelData={dashboardData?.funnelData}
      />
      <FormPaginated
        formsData={formsData}
        isLoading={isLoadingForms}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <AIInsights />
    </>
  );
}
