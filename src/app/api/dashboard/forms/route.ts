import { NextResponse } from "next/server";
import { getWorkspaceFormsData } from "@/lib/ph-server";
import { createNewForm } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    if (!workspaceId)
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );

    const formsData = await getWorkspaceFormsData(workspaceId, page, pageSize);

    return NextResponse.json(formsData);
  } catch (error) {
    console.error("Error fetching workspace forms data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { workspaceId, title, description } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    // Create new form
    const newForm = await createNewForm(
      workspaceId,
      session.user.id,
      title,
      description
    );

    return NextResponse.json({
      success: true,
      form: newForm,
      slug: newForm.slug,
    });
  } catch (error) {
    console.error("Error creating form:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("not a member") ||
        error.message.includes("Only workspace admins")
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
