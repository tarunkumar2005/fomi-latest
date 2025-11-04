import { NextResponse } from "next/server";
import { getWorkspaceFormsData } from "@/lib/ph-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    if (!workspaceId)
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

    const formsData = await getWorkspaceFormsData(
      workspaceId,
      page,
      pageSize
    );

    return NextResponse.json(formsData);
  } catch (error) {
    console.error("Error fetching workspace forms data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}