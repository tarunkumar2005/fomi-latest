import { prisma } from "./db";
import { nanoid } from "nanoid";
import type { Form } from "@prisma/client";

export const createNewForm = async (
  workspaceId: string,
  userId: string,
  title?: string,
  description?: string
): Promise<Form> => {
  // 1. Verify that user is a member of the workspace
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this workspace.");
  }

  // 2. Allow only admins to create forms
  if (member.role !== "ADMIN") {
    throw new Error("Only workspace admins can create new forms.");
  }

  // 3. Generate title and slug
  const formTitle = title?.trim() || "Untitled Form";
  const formSlug =
    formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    nanoid(6);

  const existingForm = await prisma.form.findUnique({
    where: {
      slug: formSlug,
    },
  });

  if (existingForm) {
    // Extremely rare case of slug collision Recall the function recursively
    return createNewForm(workspaceId, userId, title, description);
  }

  // 4. Create form
  const newForm = await prisma.form.create({
    data: {
      title: formTitle,
      description: description || "",
      slug: formSlug,
      workspace: { connect: { id: workspaceId } },
      owner: { connect: { id: userId } },
      version: 1,
      status: "DRAFT",
    },
  });

  // 5. Create default section
  await prisma.section.create({
    data: {
      formId: newForm.id,
      title: "Section 1",
      order: 1,
      description: "Start building your form here",
    },
  });

  // 6. Notify creator
  await prisma.notification.create({
    data: {
      userId,
      type: "FORM_CREATED",
      title: "New Form Created",
      message: `New form "${newForm.title}" has been created successfully.`,
      metadata: {
        formId: newForm.id,
        formSlug,
        workspaceId,
      },
    },
  });

  return newForm;
};

export const getAllWorkspaces = async (userId: string) => {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
  });
}

export const getFormsByWorkspaceId = async (workspaceId: string) => {
  return prisma.form.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const getTotalFormCountbyWorkspaceId = async (workspaceId: string, dateFrom: string, dateTo: string) => {
  return prisma.form.count({
    where: {
      workspaceId,
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    },
  });
};

export const getPublishedFormCountbyWorkspaceId = async (workspaceId: string, dateFrom: string, dateTo: string) => {
  return prisma.form.count({
    where: {
      workspaceId,
      status: "PUBLISHED",
      publishedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    },
  });
};

export const getSubmissionsCountbyWorkspaceId = async (workspaceId: string, dateFrom: string, dateTo: string) => {
  return prisma.response.count({
    where: {
      form: {
        workspaceId,
      },
      submittedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
      isComplete: true,
      isSpam: false,
    },
  });
};

export const getWorkspaceFormSubmissionsByDate = async (
  workspaceId: string,
  dateFrom: string,
  dateTo: string
) => {
  const results = await prisma.response.groupBy({
    by: ["submittedAt"],
    where: {
      form: {
        workspaceId,
      },
      submittedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
      isComplete: true,
      isSpam: false,
    },
    _count: { _all: true },
  });

  // Normalize to date-only and aggregate same-day entries
  const dailyTotals: Record<string, number> = {};

  for (const r of results) {
    const date = new Date(r.submittedAt)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
    dailyTotals[date] = (dailyTotals[date] || 0) + (r._count._all || 0);
  }

  // Convert to array sorted by date
  return Object.entries(dailyTotals)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
};

export const getSubmissionsGroupedByForm = async (
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, number>> => {
  const results = await prisma.response.groupBy({
    by: ["formId"],
    where: {
      form: {
        workspaceId,
      },
      submittedAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
      isComplete: true,
      isSpam: false,
    },
    _count: {
      _all: true,
    },
  });

  // Fetch slugs for mapping
  const formIds = results.map(r => r.formId);
  const forms = await prisma.form.findMany({
    where: { id: { in: formIds } },
    select: { id: true, slug: true },
  });

  const slugMap = Object.fromEntries(forms.map(f => [f.id, f.slug]));

  // Final slug → count map
  const submissionsMap: Record<string, number> = {};
  results.forEach(r => {
    const slug = slugMap[r.formId];
    if (slug) submissionsMap[slug] = r._count._all;
  });

  return submissionsMap;
};