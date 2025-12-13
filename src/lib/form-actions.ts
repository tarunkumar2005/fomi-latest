"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createNewForm } from "@/lib/prisma";

/**
 * Server action to create a new form
 */
export async function createFormAction(
  workspaceId: string,
  title?: string,
  description?: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  return await createNewForm(workspaceId, session.user.id, title, description);
}
