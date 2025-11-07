import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardData,
  getTrendsChartData,
  getGeographicData,
  getDeviceTypeData,
  getBrowserData,
  getTrafficSourceData,
  getConversionFunnel,
  getTopForms,
} from "@/lib/ph-server";
import { RangeOption } from "@/types/dashboard";

// Enable caching for this route (Next.js 13+)
export const revalidate = 120; // Revalidate every 2 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const range = searchParams.get("range") as RangeOption;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Fetch all dashboard data in parallel
    const [
      overviewData,
      trendsChartData,
      geographicData,
      deviceTypeData,
      browserData,
      trafficSourceData,
      funnelStages,
      topForms,
    ] = await Promise.all([
      getDashboardData(workspaceId, range || RangeOption["7d"]),
      getTrendsChartData(workspaceId, range || RangeOption["7d"]),
      getGeographicData(workspaceId, range || RangeOption["7d"]),
      getDeviceTypeData(workspaceId, range || RangeOption["7d"]),
      getBrowserData(workspaceId, range || RangeOption["7d"]),
      getTrafficSourceData(workspaceId, range || RangeOption["7d"]),
      getConversionFunnel(workspaceId, range || RangeOption["7d"]),
      getTopForms(workspaceId, range || RangeOption["7d"], 5),
    ]);

    return NextResponse.json({
      overviewData,
      trendsChartData,
      audienceData: {
        geographicData,
        deviceTypeData,
        browserData,
        trafficSourceData,
      },
      funnelData: {
        conversionFunnel: funnelStages,
        topForms,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
