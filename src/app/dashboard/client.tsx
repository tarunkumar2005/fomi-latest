"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Building2, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Header from "@/components/dashboard/header"
import CreateWorkspaceModal from "@/components/dashboard/create-workspace-modal"
import Overview from "@/components/dashboard/overview"
import EngagementTrends from "@/components/dashboard/engagement"
import Audience from "@/components/dashboard/audiance"
import FunnelAnalysis from "@/components/dashboard/funnel-analysis"
import FormPaginated from "@/components/dashboard/form-paginated"
import AIInsights from "@/components/dashboard/ai-insights"
import { useWorkspaces, useDashboardData, useWorkspaceFormsData } from "@/hooks/useDashboard"
import { RangeOption, type Workspace } from "@/types/dashboard"
import ErrorBoundary from "@/components/shared/ErrorBoundary"

// Loading Component
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col items-center gap-6">
        {/* Animated loader */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div
            className="absolute inset-2 h-16 w-16 rounded-full border-4 border-primary/30 border-b-transparent animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">Loading your workspace</p>
          <p className="text-xs text-muted-foreground">Please wait a moment...</p>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyWorkspaceState({ onCreateWorkspace }: { onCreateWorkspace: () => void }) {
  return (
    <div className="flex items-center justify-center pt-32 pb-16">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center border border-border/50 shadow-sm">
            <Building2 className="w-12 h-12 text-muted-foreground" />
          </div>
          {/* Decorative sparkle */}
          <div className="absolute -top-2 -right-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 className="font-heading text-2xl font-semibold text-foreground mb-3">Welcome to your dashboard</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Create your first workspace to start building and managing your forms. Workspaces help you organize forms by
          project or team.
        </p>

        {/* CTA */}
        <Button
          onClick={onCreateWorkspace}
          size="lg"
          className={cn(
            "h-12 px-8 rounded-xl",
            "bg-primary hover:bg-primary/90",
            "shadow-md hover:shadow-lg hover:shadow-primary/20",
            "transition-all duration-200",
          )}
        >
          <Building2 className="h-5 w-5 mr-2" />
          Create Workspace
        </Button>

        {/* Helper text */}
        <p className="mt-6 text-xs text-muted-foreground">
          Need help getting started?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            View documentation
          </a>
        </p>
      </div>
    </div>
  )
}

// Error Alert Component
function DashboardErrorAlert() {
  return (
    <div className="px-4 sm:px-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Failed to load dashboard data. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

// Section Wrapper Component
function DashboardSection({
  children,
  componentName,
  onError,
}: {
  children: React.ReactNode
  componentName: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}) {
  return (
    <ErrorBoundary
      componentName={componentName}
      onError={(error, errorInfo) => {
        console.error(`${componentName} error:`, error, errorInfo)
        onError?.(error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default function DashboardPageClient() {
  // Workspace data
  const { data: workspacesRaw, isLoading: isLoadingWorkspaces } = useWorkspaces()
  const workspaces: Workspace[] = Array.isArray(workspacesRaw) ? workspacesRaw : []
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [range, setRange] = useState<RangeOption>(RangeOption["24h"])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false)

  // Initialize activeWorkspace once workspaces are loaded
  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0])
    }
  }, [workspaces, activeWorkspace])

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    error: dashboardError,
  } = useDashboardData(activeWorkspace?.id, range)

  // Fetch forms data
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: formsError,
  } = useWorkspaceFormsData(activeWorkspace?.id, currentPage, pageSize)

  // Loading state
  if (isLoadingWorkspaces) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <Header activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />

      {/* Main Content */}
      {!workspaces.length && !isLoadingWorkspaces ? (
        <EmptyWorkspaceState onCreateWorkspace={() => setShowCreateWorkspaceModal(true)} />
      ) : !activeWorkspace ? null : (
        <>
          {/* Error Alert */}
          {dashboardError && <DashboardErrorAlert />}

          {/* Dashboard Sections */}
          <DashboardSection componentName="Dashboard Overview">
            <Overview
              range={range}
              setRange={setRange}
              overviewData={dashboardData?.overviewData}
              isLoading={isDashboardLoading}
              isFetching={isDashboardFetching}
            />
          </DashboardSection>

          <DashboardSection componentName="Engagement Trends">
            <EngagementTrends
              range={range}
              isLoading={isDashboardLoading}
              trendsChartData={dashboardData?.trendsChartData}
            />
          </DashboardSection>

          <DashboardSection componentName="Audience">
            <Audience isLoading={isDashboardLoading} audienceData={dashboardData?.audienceData} />
          </DashboardSection>

          <DashboardSection componentName="Funnel Analysis">
            <FunnelAnalysis isLoading={isDashboardLoading} funnelData={dashboardData?.funnelData} />
          </DashboardSection>

          <DashboardSection componentName="Forms List">
            <FormPaginated
              formsData={formsData}
              isLoading={isLoadingForms}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </DashboardSection>

          <DashboardSection componentName="AI Insights">
            <AIInsights />
          </DashboardSection>

          {/* Bottom spacer */}
          <div className="h-12" />
        </>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal open={showCreateWorkspaceModal} onOpenChange={setShowCreateWorkspaceModal} />
    </div>
  )
}