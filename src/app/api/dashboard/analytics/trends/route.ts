import { NextResponse } from "next/server";
import { getDashboardTrends } from "@/lib/prisma";
import { RangeOption } from "@/types/dashboard";

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

    // Fetch trend data
    const trends = await getDashboardTrends(workspaceId, range as RangeOption);

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Error fetching dashboard trends:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}