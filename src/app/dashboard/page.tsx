import type { Metadata } from "next";
import DashboardPageClient from "./client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your form analytics, responses, and manage your forms",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <DashboardPageClient />
    </main>
  );
}
