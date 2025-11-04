"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import Overview from "@/components/dashboard/overview";
import EngagementTrends from "@/components/dashboard/engagement";
import Audience from "@/components/dashboard/audiance";
import FunnelAnalysis from "@/components/dashboard/funnel-analysis";
import FormPaginated from "@/components/dashboard/form-paginated";
import AIInsights from "@/components/dashboard/ai-insights";
import { useDashboard } from "@/hooks/useDashboard";
import { RangeOption, Workspace } from "@/types/dashboard";

export default function DashboardPageClient() {
  const { getDashboardData, getWorkspaceFormData, workspaces } = useDashboard();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    workspaces[0]
  );
  const [range, setRange] = useState<RangeOption>(RangeOption["24h"]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form data state (separate from dashboard data)
  const [formsData, setFormsData] = useState<any>(null);
  const [isLoadingForms, setIsLoadingForms] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const fetchDashboardData = async () => {
    if (!activeWorkspace) return;

    try {
      setIsLoading(true);
      const response = await getDashboardData(activeWorkspace.id, range);
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormsData = async () => {
    if (!activeWorkspace) return;

    try {
      setIsLoadingForms(true);
      const response = await getWorkspaceFormData(
        activeWorkspace.id,
        currentPage,
        pageSize
      );
      setFormsData(response);
    } catch (error) {
      console.error("Error fetching forms data:", error);
      setFormsData(null);
    } finally {
      setIsLoadingForms(false);
    }
  };

  // Fetch dashboard data when workspace or range changes
  useEffect(() => {
    fetchDashboardData();
  }, [activeWorkspace, range]);

  // Fetch forms data when workspace or page changes
  useEffect(() => {
    fetchFormsData();
  }, [activeWorkspace, currentPage]);

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
        isLoading={isLoading}
      />
      <EngagementTrends
        range={range}
        isLoading={isLoading}
        trendsChartData={dashboardData?.trendsChartData}
      />
      <Audience
        isLoading={isLoading}
        audienceData={dashboardData?.audienceData}
      />
      <FunnelAnalysis
        isLoading={isLoading}
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
