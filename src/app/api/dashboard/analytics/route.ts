import { NextResponse } from "next/server";
import { RangeOption } from "@/types/dashboard";
import { getDashboardData, getTrendsChartData, getGeographicData, getDeviceTypeData, getBrowserData, getTrafficSourceData } from "@/lib/ph-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const range = searchParams.get("range");

    if (!workspaceId || !range)
      return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const validRanges = ["24h", "7d", "30d", "90d"];
    if (!validRanges.includes(range))
      return NextResponse.json({ error: "Invalid range" }, { status: 400 });

    // Fetch overview data
    const overviewData = await getDashboardData(
      workspaceId,
      range as RangeOption
    );
    const trendsChartData = await getTrendsChartData(
      workspaceId,
      range as RangeOption
    );

    const geographicData = await getGeographicData(
      workspaceId,
      range as RangeOption
    );

    const deviceTypeData = await getDeviceTypeData(
      workspaceId,
      range as RangeOption
    );

    const browserData = await getBrowserData(
      workspaceId,
      range as RangeOption
    );

    const trafficSourceData = await getTrafficSourceData(
      workspaceId,
      range as RangeOption
    );

    return NextResponse.json({
      overviewData,
      trendsChartData,
      audienceData: {
        geographicData,
        deviceTypeData,
        browserData,
        trafficSourceData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
