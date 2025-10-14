import Header from "@/components/dashboard/header";
import Overview from "@/components/dashboard/overview";
import EngagementTrends from "@/components/dashboard/engagement";
import Audience from "@/components/dashboard/audiance";
import FunnelAnalysis from "@/components/dashboard/funnel-analysis";
import FormPaginated from "@/components/dashboard/form-paginated";
import AIInsights from "@/components/dashboard/ai-insights";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Overview />
      <EngagementTrends />
      <Audience />
      <FunnelAnalysis />
      <FormPaginated />
      <AIInsights />
    </main>
  );
}