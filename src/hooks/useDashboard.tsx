import {
  FileText,
  CheckCircle2,
  Eye,
  Play,
  Send,
  XCircle,
  Percent,
  Clock,
  TrendingUp,
  Target,
  Globe,
} from "lucide-react";
import { SiFirefoxbrowser as FirefoxIcon } from "react-icons/si";
import { SiGooglechrome as ChromeIcon } from "react-icons/si";
import { SiSafari as SafariIcon } from "react-icons/si";

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
  const getWorkspaces = () => {
    return [
      { id: "1", name: "Marketing Team", isActive: true },
      { id: "2", name: "Product Team", isActive: false },
      { id: "3", name: "Sales Team", isActive: false },
    ]
  }

  const getOverviewMetric = (): OverviewMetric[] => {
    return [
      {
        id: "total-forms",
        icon: <FileText className="h-5 w-5" />,
        label: "Total Forms",
        value: "24",
        change: 12,
        changeColor: "positive",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        id: "published",
        icon: <CheckCircle2 className="h-5 w-5" />,
        label: "Published",
        value: "18",
        change: 8,
        changeColor: "positive",
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        id: "total-views",
        icon: <Eye className="h-5 w-5" />,
        label: "Total Views",
        value: "12.4K",
        change: 24,
        changeColor: "positive",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        id: "total-starts",
        icon: <Play className="h-5 w-5" />,
        label: "Total Starts",
        value: "8.7K",
        change: 18,
        changeColor: "positive",
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-600",
      },
      {
        id: "submissions",
        icon: <Send className="h-5 w-5" />,
        label: "Submissions",
        value: "5.2K",
        change: 22,
        changeColor: "positive",
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
      },
      {
        id: "dropoffs",
        icon: <XCircle className="h-5 w-5" />,
        label: "Drop-offs",
        value: "3.5K",
        change: 5,
        changeColor: "negative",
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
      },
      {
        id: "dropoff-rate",
        icon: <Percent className="h-5 w-5" />,
        label: "Drop-off Rate",
        value: "40.2%",
        change: 3,
        changeColor: "positive",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
      },
      {
        id: "avg-time",
        icon: <Clock className="h-5 w-5" />,
        label: "Avg. Time",
        value: "3.2m",
        change: 15,
        changeColor: "positive",
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
      },
      {
        id: "conversion",
        icon: <Target className="h-5 w-5" />,
        label: "Conversion",
        value: "59.8%",
        change: 4,
        changeColor: "positive",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        id: "weekly-growth",
        icon: <TrendingUp className="h-5 w-5" />,
        label: "Weekly Growth",
        value: "+18%",
        change: 2,
        changeColor: "positive",
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
      },
    ];
  }

  const getTrendData = () => {
    return [
      { date: "Week 1", views: 2100, starts: 1450, submissions: 890 },
      { date: "Week 2", views: 2350, starts: 1620, submissions: 980 },
      { date: "Week 3", views: 2180, starts: 1510, submissions: 920 },
      { date: "Week 4", views: 2520, starts: 1780, submissions: 1100 },
      { date: "Week 5", views: 2650, starts: 1890, submissions: 1180 },
      { date: "Week 6", views: 2400, starts: 1650, submissions: 1020 },
    ];
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
        rank: 1,
        name: "Feedback Form",
        conversionRate: 72,
        avgTime: "45s",
        height: "h-32"
      },
      {
        rank: 2,
        name: "Signup Form",
        conversionRate: 68,
        avgTime: "1.2m",
        height: "h-24"
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

  return {
    workspaces: getWorkspaces(),
    overviewMetrics: getOverviewMetric(),
    trendData: getTrendData(),
    geographicData: getGeographicData(),
    deviceData: getDeviceData(),
    browsersData: getBrowsersData(),
    trafficSources: getTrafficSources(),
    funnelStages: getFunnelStages(),
    topForms: getTopForms(),
    formsData: getFormsData(),
  }
}