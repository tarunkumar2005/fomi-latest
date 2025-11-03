import {
  FileText,
  CheckCircle2,
  Eye,
  Play,
  Send,
  XCircle,
  Percent,
  Clock,
  Globe,
} from "lucide-react";
import { SiFirefoxbrowser as FirefoxIcon } from "react-icons/si";
import { SiGooglechrome as ChromeIcon } from "react-icons/si";
import { SiSafari as SafariIcon } from "react-icons/si";
import axios from "axios";
import { RangeOption, Workspace, Plan } from "@/types/dashboard";

interface OverviewMetric {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
  changeColor: "positive" | "negative";
  iconBg: string;
  iconColor: string;
}

export const useDashboard = () => {
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
    ]
  }

  const getGeographicData = () => {
    return [
      { country: "US", fullName: "United States", value: 2300, flag: "🇺🇸", color: "#3b82f6" },
      { country: "GB", fullName: "United Kingdom", value: 1300, flag: "🇬🇧", color: "#8b5cf6" },
      { country: "CA", fullName: "Canada", value: 780, flag: "🇨🇦", color: "#10b981" },
      { country: "AU", fullName: "Australia", value: 520, flag: "🇦🇺", color: "#f59e0b" },
      { country: "DE", fullName: "Germany", value: 260, flag: "🇩🇪", color: "#ef4444" },
    ];
  }

  const getDeviceData = () => {
    return [
      { name: "Mobile", value: 58.0, color: "#8b5cf6" },
      { name: "Desktop", value: 32.0, color: "#3b82f6" },
      { name: "Tablet", value: 10.0, color: "#10b981" },
    ];
  }

  const getBrowsersData = () => {
    return [
      { name: "Chrome", percentage: 68, icon: ChromeIcon, color: "text-blue-600", bgColor: "bg-blue-50" },
      { name: "Safari", percentage: 18, icon: SafariIcon, color: "text-cyan-600", bgColor: "bg-cyan-50" },
      { name: "Firefox", percentage: 8, icon: FirefoxIcon, color: "text-orange-600", bgColor: "bg-orange-50" },
      { name: "Edge", percentage: 6, icon: Globe, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    ];
  }

  const getTrafficSources = () => {
    return [
      { name: "Direct", percentage: 42, color: "bg-blue-500" },
      { name: "Social Media", percentage: 28, color: "bg-purple-500" },
      { name: "Email", percentage: 20, color: "bg-green-500" },
      { name: "Referral", percentage: 10, color: "bg-orange-500" },
    ];
  }

  const getFunnelStages = () => {
    return [
      { stage: "Views", value: 12400, percentage: 100, color: "#3b82f6", dropoff: 0 },
      { stage: "Starts", value: 7440, percentage: 60, color: "#8b5cf6", dropoff: 40 },
      { stage: "Submissions", value: 5356, percentage: 43.2, color: "#10b981", dropoff: 28 },
    ];
  }

  const getTopForms = () => {
    return [
      {
        rank: 2,
        name: "Signup Form",
        conversionRate: 68,
        avgTime: "1.2m",
        height: "h-24"
      },
      {
        rank: 1,
        name: "Feedback Form",
        conversionRate: 72,
        avgTime: "45s",
        height: "h-32"
      },
      {
        rank: 3,
        name: "Contact Form",
        conversionRate: 54,
        avgTime: "2.1m",
        height: "h-20"
      },
    ];
  }

  const getFormsData = () => {
    return [
      {
        id: 1,
        name: "Customer Feedback Survey",
        status: "published",
        createdAt: "Oct 11, 2025",
        views: 1245,
        completions: 892,
        rate: 71.6
      },
      {
        id: 2,
        name: "Event Participation Form",
        status: "published",
        createdAt: "Oct 10, 2025",
        views: 856,
        completions: 623,
        rate: 72.8
      },
      {
        id: 3,
        name: "Newsletter Signup",
        status: "unpublished",
        createdAt: "Oct 9, 2025",
        views: 432,
        completions: 156,
        rate: 36.1
      },
      {
        id: 4,
        name: "Contact Form",
        status: "published",
        createdAt: "Oct 8, 2025",
        views: 2341,
        completions: 1567,
        rate: 66.9
      },
      {
        id: 5,
        name: "Job Application Form",
        status: "published",
        createdAt: "Oct 7, 2025",
        views: 678,
        completions: 445,
        rate: 65.6
      },
      {
        id: 6,
        name: "Product Inquiry",
        status: "unpublished",
        createdAt: "Oct 6, 2025",
        views: 234,
        completions: 89,
        rate: 38.0
      },
      {
        id: 7,
        name: "Registration Form",
        status: "published",
        createdAt: "Oct 5, 2025",
        views: 1567,
        completions: 1123,
        rate: 71.7
      },
      {
        id: 8,
        name: "Support Ticket",
        status: "published",
        createdAt: "Oct 4, 2025",
        views: 987,
        completions: 654,
        rate: 66.3
      },
    ];
  }

  const getDashboardData = async (
    workspaceId: string,
    range: RangeOption
  ) => {
    const dashboardData = await axios.get('/api/dashboard/analytics', {
      params: { workspaceId, range }
    })

    return dashboardData.data;
  }

  return {
    workspaces: getWorkspaces(),
    geographicData: getGeographicData(),
    deviceData: getDeviceData(),
    browsersData: getBrowsersData(),
    trafficSources: getTrafficSources(),
    funnelStages: getFunnelStages(),
    topForms: getTopForms(),
    formsData: getFormsData(),
    getDashboardData,
  }
}