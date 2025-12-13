"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import CreateWorkspaceModal from "@/components/dashboard/create-workspace-modal";
import Overview from "@/components/dashboard/overview";
import EngagementTrends from "@/components/dashboard/engagement";
import Audience from "@/components/dashboard/audiance";
import FunnelAnalysis from "@/components/dashboard/funnel-analysis";
import FormPaginated from "@/components/dashboard/form-paginated";
import AIInsights from "@/components/dashboard/ai-insights";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import {
  useWorkspaces,
  useDashboardData,
  useWorkspaceFormsData,
} from "@/hooks/useDashboard";
import { RangeOption, type Workspace } from "@/types/dashboard";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

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
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

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

  if (isLoadingWorkspaces) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <Header
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
      />

      {!workspaces.length && !isLoadingWorkspaces ? (
        <div className="flex items-center justify-center pt-32 pb-16">
          <div className="text-center max-w-md px-6">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No workspaces found
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first workspace to start building and managing your
              forms.
            </p>
            <Button
              onClick={() => setShowCreateWorkspaceModal(true)}
              className="mt-2"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>
      ) : !activeWorkspace ? null : (
        <>
          {dashboardError && (
            <div className="px-4 sm:px-6 pt-20">
              <div className="max-w-7xl mx-auto">
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertDescription className="text-destructive">
                    Failed to load dashboard data. Please refresh the page.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          <ErrorBoundary
            componentName="Dashboard Overview"
            onError={(error, errorInfo) => {
              console.error("Dashboard overview error:", error, errorInfo);
            }}
          >
            <Overview
              range={range}
              setRange={setRange}
              overviewData={dashboardData?.overviewData}
              isLoading={isDashboardLoading}
              isFetching={isDashboardFetching}
            />
          </ErrorBoundary>

          <ErrorBoundary
            componentName="Engagement Trends"
            onError={(error, errorInfo) => {
              console.error("Engagement trends error:", error, errorInfo);
            }}
          >
            <EngagementTrends
              range={range}
              isLoading={isDashboardLoading}
              trendsChartData={dashboardData?.trendsChartData}
            />
          </ErrorBoundary>

          <ErrorBoundary
            componentName="Audience"
            onError={(error, errorInfo) => {
              console.error("Audience error:", error, errorInfo);
            }}
          >
            <Audience
              isLoading={isDashboardLoading}
              audienceData={dashboardData?.audienceData}
            />
          </ErrorBoundary>

          <ErrorBoundary
            componentName="Funnel Analysis"
            onError={(error, errorInfo) => {
              console.error("Funnel analysis error:", error, errorInfo);
            }}
          >
            <FunnelAnalysis
              isLoading={isDashboardLoading}
              funnelData={dashboardData?.funnelData}
            />
          </ErrorBoundary>

          <ErrorBoundary
            componentName="Forms List"
            onError={(error, errorInfo) => {
              console.error("Forms list error:", error, errorInfo);
            }}
          >
            <FormPaginated
              formsData={formsData}
              isLoading={isLoadingForms}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </ErrorBoundary>

          <ErrorBoundary
            componentName="AI Insights"
            onError={(error, errorInfo) => {
              console.error("AI insights error:", error, errorInfo);
            }}
          >
            <AIInsights />
          </ErrorBoundary>

          <div className="h-12" />
        </>
      )}

      <CreateWorkspaceModal
        open={showCreateWorkspaceModal}
        onOpenChange={setShowCreateWorkspaceModal}
      />
    </div>
  );
}
