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
  const { getDashboardData, workspaces } = useDashboard();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    workspaces[0]
  );
  const [range, setRange] = useState<RangeOption>(RangeOption["24h"]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    if (!activeWorkspace) return;

    try {
      setIsLoading(true);
      const response = await getDashboardData(activeWorkspace.id, range);
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data on error so UI still shows with N/A values
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeWorkspace, range]);

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
      <Audience />
      <FunnelAnalysis />
      <FormPaginated />
      <AIInsights />
    </>
  );
}
