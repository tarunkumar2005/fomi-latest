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
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);
  const [range, setRange] = useState<RangeOption>(RangeOption["24h"]);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchOverviewData = async () => {
    if (!activeWorkspace) return;

    const response = await getDashboardData(activeWorkspace.id, range);
    setDashboardData(response);
  };

  useEffect(() => {
    fetchOverviewData();
  }, [activeWorkspace, range]);

  return (
    <>
      <Header activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />
      <Overview range={range} setRange={setRange} overviewData={dashboardData} />
      <EngagementTrends />
      <Audience />
      <FunnelAnalysis />
      <FormPaginated />
      <AIInsights />
    </>
  );
}