import { NextRequest, NextResponse } from "next/server";
import { getFormBySlug } from "@/lib/prisma";

export const revalidate = 120; // Revalidate every 2 minutes

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
  }

  try {
    const form = await getFormBySlug(slug);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}