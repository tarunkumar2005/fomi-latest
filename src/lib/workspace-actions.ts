"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateMemberRole,
} from "@/lib/prisma";

/**
 * Server action to get all workspaces for the authenticated user
 */
export async function fetchUserWorkspaces() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getUserWorkspaces(session.user.id);
}

/**
 * Server action to create a new workspace
 */
export async function createWorkspaceAction(
  name: string,
  description?: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!name || name.trim().length === 0) {
    throw new Error("Workspace name is required");
  }

  return await createWorkspace(
    session.user.id,
    name.trim(),
    description?.trim()
  );
}

/**
 * Server action to get workspace by ID
 */
export async function fetchWorkspaceById(workspaceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getWorkspaceById(workspaceId, session.user.id);
}

/**
 * Server action to update workspace
 */
export async function updateWorkspaceAction(
  workspaceId: string,
  updates: {
    name?: string;
    description?: string;
    plan?: "FREE" | "PRO";
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await updateWorkspace(workspaceId, session.user.id, updates);
}

/**
 * Server action to delete workspace
 */
export async function deleteWorkspaceAction(workspaceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await deleteWorkspace(workspaceId, session.user.id);
}

/**
 * Server action to add member to workspace
 */
export async function addWorkspaceMemberAction(
  workspaceId: string,
  memberEmail: string,
  role: "ADMIN" | "MEMBER" = "MEMBER"
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await addWorkspaceMember(
    workspaceId,
    session.user.id,
    memberEmail,
    role
  );
}

/**
 * Server action to remove member from workspace
 */
export async function removeWorkspaceMemberAction(
  workspaceId: string,
  memberUserId: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await removeWorkspaceMember(
    workspaceId,
    session.user.id,
    memberUserId
  );
}

/**
 * Server action to update member role
 */
export async function updateMemberRoleAction(
  workspaceId: string,
  memberUserId: string,
  newRole: "ADMIN" | "MEMBER"
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await updateMemberRole(
    workspaceId,
    session.user.id,
    memberUserId,
    newRole
  );
}
