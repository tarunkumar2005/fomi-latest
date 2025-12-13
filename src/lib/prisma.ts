"use server";

import { prisma } from "./db";
import { nanoid } from "nanoid";
import type { Form, Section, Field } from "@/app/generated/prisma/client";
import type { NextSectionLogic } from "@/types/conditional-logic";

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique form slug from title
 * @param title - The form title
 * @returns A URL-safe slug with random suffix
 */
function generateFormSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${baseSlug}-${nanoid(6)}`;
}

/**
 * Build date range filter for Prisma queries
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Prisma date filter object
 */
function buildDateRangeFilter(dateFrom: string, dateTo: string) {
  return {
    gte: new Date(dateFrom),
    lte: new Date(dateTo),
  };
}

// ==================== FORM CRUD OPERATIONS ====================

/**
 * Create a new form with default section
 * @throws Error if user is not workspace admin
 * @throws Error if form creation fails
 */
export async function createNewForm(
  workspaceId: string,
  userId: string,
  title?: string,
  description?: string
): Promise<Form> {
  try {
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
    const formSlug = generateFormSlug(formTitle);

    const existingForm = await prisma.form.findUnique({
      where: { slug: formSlug },
    });

    if (existingForm) {
      // Extremely rare case of slug collision - retry recursively
      return createNewForm(workspaceId, userId, title, description);
    }

    // 4. Create form, section, and notification in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newForm = await tx.form.create({
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

      // Create default section
      await tx.section.create({
        data: {
          formId: newForm.id,
          title: "Section 1",
          order: 1,
          description: "Start building your form here",
        },
      });

      // Notify creator
      await tx.notification.create({
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
    });

    return result;
  } catch (error) {
    console.error("Failed to create form:", error);
    throw error;
  }
}

/**
 * Get form by slug
 * @param slug - The form slug
 * @returns Form data or null if not found
 * @throws Error if database query fails
 */
export async function getFormBySlug(slug: string): Promise<Form | null> {
  try {
    return await prisma.form.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("Failed to fetch form by slug:", error);
    throw new Error("Failed to fetch form");
  }
}

/**
 * Get form header data by slug (for edit page)
 * @param slug - The form slug
 * @returns Form header data or null
 * @throws Error if database query fails
 */
export async function getFormHeaderByFormSlug(slug: string) {
  try {
    return await prisma.form.findUnique({
      where: { slug },
      select: {
        id: true, // Added for section loading
        title: true,
        description: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        headerImageUrl: true,
        workspaceId: true, // Added for workspace operations
        // Form Settings
        closeDate: true,
        responseLimit: true,
        oneResponsePerUser: true,
        thankYouMessage: true,
        // Workspace info for navigation
        workspace: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch form header:", error);
    throw new Error("Failed to fetch form header");
  }
}

/**
 * Save/update form title and description
 * @param slug - The form slug
 * @param data - Form data to update
 * @returns Updated form
 * @throws Error if form not found or update fails
 */
export async function saveForm(
  slug: string,
  data: { title?: string; description?: string; headerImageUrl?: string }
): Promise<Form> {
  try {
    return await prisma.form.update({
      where: { slug },
      data: {
        title: data.title,
        description: data.description,
        headerImageUrl: data.headerImageUrl,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to save form:", error);
    throw new Error("Failed to save form");
  }
}

/**
 * Update form settings (close date, response limit, etc.)
 * @param slug - The form slug
 * @param settings - Form settings to update
 * @returns Updated form
 * @throws Error if form not found or update fails
 */
export async function updateFormSettings(
  slug: string,
  settings: {
    closeDate?: Date | null;
    responseLimit?: number | null;
    oneResponsePerUser?: boolean;
    thankYouMessage?: string | null;
  }
): Promise<Form> {
  try {
    return await prisma.form.update({
      where: { slug },
      data: {
        closeDate: settings.closeDate,
        responseLimit: settings.responseLimit,
        oneResponsePerUser: settings.oneResponsePerUser,
        thankYouMessage: settings.thankYouMessage,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update form settings:", error);
    throw new Error("Failed to update form settings");
  }
}

/**
 * Toggle form status between DRAFT and PUBLISHED
 * @param slug - The form slug
 * @param status - New status
 * @returns Updated form
 * @throws Error if form not found or update fails
 */
export async function toggleFormStatus(
  slug: string,
  status: "DRAFT" | "PUBLISHED"
): Promise<Form> {
  try {
    return await prisma.form.update({
      where: { slug },
      data: { status },
    });
  } catch (error) {
    console.error("Failed to toggle form status:", error);
    throw new Error("Failed to toggle form status");
  }
}

/**
 * Duplicate an existing form
 * @param formId - The ID of the form to duplicate
 * @param workspaceId - The workspace ID
 * @param userId - The user ID creating the duplicate
 * @returns Newly created form
 * @throws Error if original form not found or creation fails
 */
export async function duplicateForm(
  formId: string,
  workspaceId: string,
  userId: string
): Promise<Form> {
  try {
    const originalForm = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!originalForm) {
      throw new Error("Original form not found.");
    }

    const newFormTitle = originalForm.title + " (Copy)";
    const newFormSlug = generateFormSlug(newFormTitle);

    const newForm = await prisma.form.create({
      data: {
        title: newFormTitle,
        description: originalForm.description,
        slug: newFormSlug,
        workspace: { connect: { id: workspaceId } },
        owner: { connect: { id: userId } },
        version: 1,
        status: "DRAFT",
      },
    });

    return newForm;
  } catch (error) {
    console.error("Failed to duplicate form:", error);
    throw new Error("Failed to duplicate form");
  }
}

/**
 * Delete form by slug
 * @param slug - The form slug
 * @returns Deleted form
 * @throws Error if form not found or deletion fails
 */
export async function deleteFormBySlug(slug: string): Promise<Form> {
  try {
    return await prisma.form.delete({
      where: { slug },
    });
  } catch (error) {
    console.error("Failed to delete form:", error);
    throw new Error("Failed to delete form");
  }
}

// ==================== WORKSPACE OPERATIONS ====================

/**
 * Get all workspaces for a user
 * @param userId - The user ID
 * @returns List of workspaces
 * @throws Error if database query fails
 */
export async function getAllWorkspaces(userId: string) {
  try {
    return await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    throw new Error("Failed to fetch workspaces");
  }
}

/**
 * Get all forms in a workspace
 * @param workspaceId - The workspace ID
 * @returns List of forms
 * @throws Error if database query fails
 */
export async function getFormsByWorkspaceId(workspaceId: string) {
  try {
    return await prisma.form.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch forms by workspace:", error);
    throw new Error("Failed to fetch forms");
  }
}

/**
 * Get total form count for workspace in date range
 * @param workspaceId - The workspace ID
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Count of forms
 * @throws Error if database query fails
 */
export async function getTotalFormCountByWorkspaceId(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<number> {
  try {
    return await prisma.form.count({
      where: {
        workspaceId,
        createdAt: buildDateRangeFilter(dateFrom, dateTo),
      },
    });
  } catch (error) {
    console.error("Failed to get form count:", error);
    throw new Error("Failed to get form count");
  }
}

/**
 * Get published form count for workspace in date range
 * @param workspaceId - The workspace ID
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Count of published forms
 * @throws Error if database query fails
 */
export async function getPublishedFormCountByWorkspaceId(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<number> {
  try {
    return await prisma.form.count({
      where: {
        workspaceId,
        status: "PUBLISHED",
        publishedAt: buildDateRangeFilter(dateFrom, dateTo),
      },
    });
  } catch (error) {
    console.error("Failed to get published form count:", error);
    throw new Error("Failed to get published form count");
  }
}

// ==================== ANALYTICS & SUBMISSIONS ====================

/**
 * Get submissions count for workspace in date range
 * @param workspaceId - The workspace ID
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Count of submissions
 * @throws Error if database query fails
 */
export async function getSubmissionsCountByWorkspaceId(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<number> {
  try {
    return await prisma.response.count({
      where: {
        form: { workspaceId },
        submittedAt: buildDateRangeFilter(dateFrom, dateTo),
        isComplete: true,
        isSpam: false,
      },
    });
  } catch (error) {
    console.error("Failed to get submissions count:", error);
    throw new Error("Failed to get submissions count");
  }
}

/**
 * Get form submissions grouped by date
 * @param workspaceId - The workspace ID
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Array of { date, total } objects
 * @throws Error if database query fails
 */
export async function getWorkspaceFormSubmissionsByDate(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<Array<{ date: string; total: number }>> {
  try {
    const results = await prisma.response.groupBy({
      by: ["submittedAt"],
      where: {
        form: { workspaceId },
        submittedAt: buildDateRangeFilter(dateFrom, dateTo),
        isComplete: true,
        isSpam: false,
      },
      _count: { _all: true },
    });

    // Normalize to date-only and aggregate same-day entries
    const dailyTotals: Record<string, number> = {};

    for (const r of results) {
      const date = new Date(r.submittedAt).toISOString().split("T")[0]; // YYYY-MM-DD
      dailyTotals[date] = (dailyTotals[date] || 0) + (r._count._all || 0);
    }

    // Convert to array sorted by date
    return Object.entries(dailyTotals)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  } catch (error) {
    console.error("Failed to get submissions by date:", error);
    throw new Error("Failed to get submissions by date");
  }
}

/**
 * Get submissions grouped by form
 * @param workspaceId - The workspace ID
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Map of form slug to submission count
 * @throws Error if database query fails
 */
export async function getSubmissionsGroupedByForm(
  workspaceId: string,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, number>> {
  try {
    const results = await prisma.response.groupBy({
      by: ["formId"],
      where: {
        form: { workspaceId },
        submittedAt: buildDateRangeFilter(dateFrom, dateTo),
        isComplete: true,
        isSpam: false,
      },
      _count: { _all: true },
    });

    // Fetch slugs for mapping
    const formIds = results.map((r) => r.formId);
    const forms = await prisma.form.findMany({
      where: { id: { in: formIds } },
      select: { id: true, slug: true },
    });

    const slugMap = Object.fromEntries(forms.map((f) => [f.id, f.slug]));

    // Final slug → count map
    const submissionsMap: Record<string, number> = {};
    results.forEach((r) => {
      const slug = slugMap[r.formId];
      if (slug) submissionsMap[slug] = r._count._all;
    });

    return submissionsMap;
  } catch (error) {
    console.error("Failed to get submissions grouped by form:", error);
    throw new Error("Failed to get submissions grouped by form");
  }
}

/**
 * Get paginated forms summary with submission counts
 * @param workspaceId - The workspace ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Forms summary with pagination info
 * @throws Error if database query fails
 */
export async function getWorkspaceFormsSummary(
  workspaceId: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const totalCount = await prisma.form.count({
      where: { workspaceId },
    });

    const forms = await prisma.form.findMany({
      where: { workspaceId },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            responses: {
              where: {
                isComplete: true,
                isSpam: false,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      forms: forms.map((form) => ({
        id: form.id,
        slug: form.slug,
        name: form.title,
        status: form.status.toLowerCase(),
        createdAt: form.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        completions: form._count.responses,
      })),
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error("Failed to get workspace forms summary:", error);
    throw new Error("Failed to get workspace forms summary");
  }
}

// ==================== SECTION MANAGEMENT ====================

/**
 * Get all sections for a form with their fields
 * @param formId - The form ID
 * @returns Array of sections with nested fields
 * @throws Error if database query fails
 */
export async function getFormSectionsByFormId(formId: string) {
  try {
    return await prisma.section.findMany({
      where: { formId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch form sections:", error);
    throw new Error("Failed to fetch form sections");
  }
}

/**
 * Create a new section
 * @param formId - The form ID
 * @param title - Section title
 * @param description - Section description
 * @returns Newly created section
 * @throws Error if creation fails
 */
export async function createSection(
  formId: string,
  title: string,
  description: string
): Promise<Section> {
  try {
    const lastSection = await prisma.section.findFirst({
      where: { formId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return await prisma.section.create({
      data: {
        formId,
        title,
        description,
        order: lastSection ? lastSection.order + 1 : 1,
      },
    });
  } catch (error) {
    console.error("Failed to create section:", error);
    throw new Error("Failed to create section");
  }
}

/**
 * Update section details
 * @param sectionId - The section ID
 * @param data - Data to update
 * @returns Updated section
 * @throws Error if section not found or update fails
 */
export async function updateSection(
  sectionId: string,
  data: {
    title?: string;
    description?: string | null;
    nextSectionLogic?: any;
  }
): Promise<Section> {
  try {
    return await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update section:", error);
    throw new Error("Failed to update section");
  }
}

/**
 * Delete a section (fields will cascade delete)
 * @param sectionId - The section ID
 * @returns Deleted section
 * @throws Error if section not found or deletion fails
 */
export async function deleteSection(sectionId: string): Promise<Section> {
  try {
    return await prisma.section.delete({
      where: { id: sectionId },
    });
  } catch (error) {
    console.error("Failed to delete section:", error);
    throw new Error("Failed to delete section");
  }
}

/**
 * Duplicate a section with all its fields
 * Creates a copy of the section and all associated fields with new IDs
 * @param sectionId - The section ID to duplicate
 * @returns The newly created section with all fields
 * @throws Error if section not found or duplication fails
 */
export async function duplicateSection(sectionId: string) {
  try {
    // 1. Get the original section with all fields
    const originalSection = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!originalSection) {
      throw new Error("Section not found");
    }

    // 2. Get the max order for sections in this form
    const maxOrderSection = await prisma.section.findFirst({
      where: { formId: originalSection.formId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newSectionOrder = (maxOrderSection?.order || 0) + 1;

    // 3. Create the duplicated section
    const duplicatedSection = await prisma.section.create({
      data: {
        formId: originalSection.formId,
        title: `${originalSection.title} (Copy)`,
        description: originalSection.description,
        order: newSectionOrder,
        nextSectionLogic: originalSection.nextSectionLogic || undefined,
        isRepeatable: originalSection.isRepeatable,
        repeatCount: originalSection.repeatCount,
        // Don't include fields in create - we'll add them separately
      },
      include: {
        fields: true,
      },
    });

    // 4. Duplicate all fields for this section
    if (originalSection.fields.length > 0) {
      const fieldPromises = originalSection.fields.map((field) =>
        prisma.field.create({
          data: {
            sectionId: duplicatedSection.id,
            question: field.question,
            type: field.type,
            required: field.required,
            order: field.order,
            placeholder: field.placeholder,
            description: field.description,
            options: field.options || undefined,
            metadata: field.metadata || undefined,
            isHidden: field.isHidden,
            minLength: field.minLength,
            maxLength: field.maxLength,
            pattern: field.pattern,
            min: field.min,
            max: field.max,
            step: field.step,
            customValidation: field.customValidation || undefined,
            rows: field.rows,
            gridColumns: field.gridColumns,
            acceptedTypes: field.acceptedTypes,
            maxFileSize: field.maxFileSize,
            maxFiles: field.maxFiles,
            requiredFiles: field.requiredFiles,
            minDate: field.minDate,
            maxDate: field.maxDate,
            minTime: field.minTime,
            maxTime: field.maxTime,
            maxRating: field.maxRating,
            ratingStyle: field.ratingStyle,
            minLabel: field.minLabel,
            maxLabel: field.maxLabel,
            conditional: field.conditional || undefined,
          },
        })
      );

      await Promise.all(fieldPromises);
    }

    // 5. Return the duplicated section with all fields
    return await prisma.section.findUniqueOrThrow({
      where: { id: duplicatedSection.id },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to duplicate section:", error);
    throw new Error("Failed to duplicate section");
  }
}

/**
 * Reorder sections (batch update)
 * @param sectionOrders - Array of section IDs with new order values
 * @returns Array of updated sections
 * @throws Error if update fails
 */
export async function reorderSections(
  sectionOrders: Array<{ sectionId: string; order: number }>
): Promise<Section[]> {
  try {
    const updatePromises = sectionOrders.map(({ sectionId, order }) =>
      prisma.section.update({
        where: { id: sectionId },
        data: { order },
      })
    );

    return await Promise.all(updatePromises);
  } catch (error) {
    console.error("Failed to reorder sections:", error);
    throw new Error("Failed to reorder sections");
  }
}

/**
 * Update section repeatability settings
 * Controls whether a section can be repeated by form respondents
 * @param sectionId - The section ID to update
 * @param isRepeatable - Whether the section should be repeatable
 * @param repeatCount - Maximum number of times section can be repeated (1-10)
 * @returns Updated section
 * @throws Error if validation fails or update fails
 */
export async function updateSectionRepeatability(
  sectionId: string,
  isRepeatable: boolean,
  repeatCount?: number
): Promise<Section> {
  try {
    // Validate repeat count
    if (isRepeatable) {
      if (!repeatCount || repeatCount < 1 || repeatCount > 10) {
        throw new Error("Repeat count must be between 1 and 10");
      }
    }

    // Check if section has conditional logic
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { nextSectionLogic: true },
    });

    if (!section) {
      throw new Error("Section not found");
    }

    // Prevent enabling repeatability if section has conditional navigation
    if (isRepeatable && section.nextSectionLogic) {
      const logic = section.nextSectionLogic as any;
      if (logic?.type === "conditional" && logic?.rules?.length > 0) {
        throw new Error(
          "Cannot enable repeatability on sections with conditional navigation. Please remove conditional logic first."
        );
      }
    }

    // Update the section
    return await prisma.section.update({
      where: { id: sectionId },
      data: {
        isRepeatable,
        repeatCount: isRepeatable ? repeatCount : 1,
      },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to update section repeatability:", error);
    throw error;
  }
}

// ==================== CONDITIONAL LOGIC FUNCTIONS ====================

/**
 * Update section's conditional navigation logic
 * @param sectionId - The section ID
 * @param logic - The navigation logic configuration
 * @returns Updated section
 * @throws Error if section not found or update fails
 */
export async function updateSectionLogic(
  sectionId: string,
  logic: NextSectionLogic
): Promise<Section> {
  try {
    return await prisma.section.update({
      where: { id: sectionId },
      data: {
        nextSectionLogic: logic as any, // JSON field
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update section logic:", error);
    throw new Error("Failed to update section logic");
  }
}

/**
 * Get section with its fields (needed for conditional logic UI)
 * @param sectionId - The section ID
 * @returns Section with fields or null
 * @throws Error if query fails
 */
export async function getSectionWithFields(
  sectionId: string
): Promise<(Section & { fields: Field[] }) | null> {
  try {
    return await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to get section with fields:", error);
    throw new Error("Failed to get section with fields");
  }
}

/**
 * Get fields that support conditional logic for a section
 * @param sectionId - The section ID
 * @returns Array of fields that support conditions
 * @throws Error if query fails
 */
export async function getConditionalFields(
  sectionId: string
): Promise<Field[]> {
  try {
    return await prisma.field.findMany({
      where: {
        sectionId,
        type: {
          in: [
            "MULTIPLE_CHOICE",
            "DROPDOWN",
            "CHECKBOXES",
            "RATING",
            "LINEAR_SCALE",
          ],
        },
      },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to get conditional fields:", error);
    throw new Error("Failed to get conditional fields");
  }
}

/**
 * Get all sections for a form (used for target section selector)
 * @param formId - The form ID
 * @returns Array of sections ordered by order field
 * @throws Error if query fails
 */
export async function getFormSectionsForNavigation(formId: string): Promise<
  Array<{
    id: string;
    title: string;
    order: number;
  }>
> {
  try {
    return await prisma.section.findMany({
      where: { formId },
      select: {
        id: true,
        title: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to get form sections for navigation:", error);
    throw new Error("Failed to get form sections for navigation");
  }
}

/**
 * Validate section navigation logic (check for circular references, invalid targets)
 * @param formId - The form ID
 * @param sectionId - The section being updated
 * @param logic - The proposed navigation logic
 * @returns Validation result with errors if any
 * @throws Error if validation query fails
 */
export async function validateSectionLogic(
  formId: string,
  sectionId: string,
  logic: NextSectionLogic
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const errors: string[] = [];

    // If linear mode, no validation needed
    if (logic.type === "linear") {
      return { valid: true, errors: [] };
    }

    // Get all sections and fields for validation
    const [sections, sectionWithFields] = await Promise.all([
      prisma.section.findMany({
        where: { formId },
        select: { id: true, order: true, title: true },
      }),
      prisma.section.findUnique({
        where: { id: sectionId },
        include: { fields: true },
      }),
    ]);

    if (!sectionWithFields) {
      errors.push("Section not found");
      return { valid: false, errors };
    }

    const validSectionIds = sections.map((s) => s.id);
    const validFieldIds = sectionWithFields.fields.map((f) => f.id);

    // Validate each rule
    for (const rule of logic.rules) {
      // Check if field exists in this section
      if (!validFieldIds.includes(rule.fieldId)) {
        errors.push(
          `Field ${rule.fieldId} not found in section ${sectionWithFields.title}`
        );
      }

      // Check if target section exists (unless it's NEXT or SUBMIT)
      if (
        rule.targetSectionId !== "NEXT" &&
        rule.targetSectionId !== "SUBMIT" &&
        !validSectionIds.includes(rule.targetSectionId)
      ) {
        errors.push(`Target section ${rule.targetSectionId} not found`);
      }

      // Check for direct self-reference (Section A -> Section A)
      if (rule.targetSectionId === sectionId) {
        errors.push(
          `Cannot create direct loop: section cannot navigate to itself`
        );
      }
    }

    // Check default target
    if (
      logic.defaultTarget !== "NEXT" &&
      logic.defaultTarget !== "SUBMIT" &&
      !validSectionIds.includes(logic.defaultTarget)
    ) {
      errors.push(`Default target section ${logic.defaultTarget} not found`);
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    console.error("Failed to validate section logic:", error);
    throw new Error("Failed to validate section logic");
  }
}

/**
 * Check for circular references in section navigation
 * This is a deep check that traverses the entire navigation graph
 * @param formId - The form ID
 * @returns Object with circular reference information
 * @throws Error if query fails
 */
export async function detectCircularReferences(formId: string): Promise<{
  hasCircularReference: boolean;
  cycles: string[][];
}> {
  try {
    const sections = await prisma.section.findMany({
      where: { formId },
      select: {
        id: true,
        title: true,
        nextSectionLogic: true,
      },
    });

    const cycles: string[][] = [];

    // Build adjacency list from navigation logic
    const graph = new Map<string, Set<string>>();
    sections.forEach((section) => {
      graph.set(section.id, new Set());

      const logic = section.nextSectionLogic as NextSectionLogic | null;
      if (logic && logic.type === "conditional") {
        logic.rules.forEach((rule) => {
          if (
            rule.targetSectionId !== "NEXT" &&
            rule.targetSectionId !== "SUBMIT"
          ) {
            graph.get(section.id)?.add(rule.targetSectionId);
          }
        });
      }
    });

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(nodeId: string, path: string[]): boolean {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = graph.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path])) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          cycles.push([...path.slice(cycleStart), neighbor]);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    }

    // Check each section as potential starting point
    for (const section of sections) {
      if (!visited.has(section.id)) {
        dfs(section.id, []);
      }
    }

    return {
      hasCircularReference: cycles.length > 0,
      cycles,
    };
  } catch (error) {
    console.error("Failed to detect circular references:", error);
    throw new Error("Failed to detect circular references");
  }
}

// ==================== SECTION TEMPLATE OPERATIONS ====================

/**
 * Get all built-in section templates
 * @param category - Optional category filter
 * @returns Array of section templates with their fields
 */
export async function getAllSectionTemplates(category?: string) {
  try {
    const templates = await prisma.sectionTemplate.findMany({
      where: {
        isBuiltIn: true,
        ...(category && { category }),
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return templates;
  } catch (error) {
    console.error("Failed to fetch section templates:", error);
    throw new Error("Failed to fetch section templates");
  }
}

/**
 * Get a single template by ID with all fields
 * @param templateId - Template ID
 * @returns Template with fields
 */
export async function getSectionTemplateById(templateId: string) {
  try {
    const template = await prisma.sectionTemplate.findUnique({
      where: { id: templateId },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  } catch (error) {
    console.error("Failed to fetch template:", error);
    throw new Error("Failed to fetch template");
  }
}

/**
 * Search templates by name or description
 * @param searchQuery - Search string
 * @returns Matching templates
 */
export async function searchSectionTemplates(searchQuery: string) {
  try {
    const templates = await prisma.sectionTemplate.findMany({
      where: {
        isBuiltIn: true,
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return templates;
  } catch (error) {
    console.error("Failed to search templates:", error);
    throw new Error("Failed to search templates");
  }
}

/**
 * Get template categories with count
 * @returns Array of categories with template counts
 */
export async function getTemplateCategories() {
  try {
    const categories = await prisma.sectionTemplate.groupBy({
      by: ["category"],
      where: {
        isBuiltIn: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    return categories.map((cat) => ({
      category: cat.category,
      count: cat._count.id,
    }));
  } catch (error) {
    console.error("Failed to fetch template categories:", error);
    throw new Error("Failed to fetch template categories");
  }
}

/**
 * Create a section from a template
 * @param formId - Form ID to add section to
 * @param templateId - Template ID to use
 * @returns Created section with fields
 */
export async function createSectionFromTemplate(
  formId: string,
  templateId: string
) {
  try {
    // 1. Get the template with fields
    const template = await getSectionTemplateById(templateId);

    // 2. Get current section count for order
    const sectionCount = await prisma.section.count({
      where: { formId },
    });

    // 3. Create section with fields from template
    const section = await prisma.section.create({
      data: {
        formId,
        title: template.name,
        description: template.description,
        order: sectionCount,
        fields: {
          create: template.fields.map((field) => {
            // Parse validation rules
            const validation =
              field.validation && typeof field.validation === "object"
                ? (field.validation as any)
                : {};

            return {
              type: field.type.toUpperCase().replace(/-/g, "_") as any, // Convert to FieldType enum
              question: field.question,
              description: field.description || null,
              required: field.required,
              order: field.order,
              options:
                field.options === null ? undefined : (field.options as any),
              metadata:
                field.metadata === null ? undefined : (field.metadata as any),
              // Map validation rules if present
              min: validation.min ?? undefined,
              max: validation.max ?? undefined,
              minLength: validation.minLength ?? undefined,
              maxLength: validation.maxLength ?? undefined,
              pattern: validation.pattern ?? undefined,
            };
          }),
        },
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return section;
  } catch (error) {
    console.error("Failed to create section from template:", error);
    throw new Error("Failed to create section from template");
  }
}

// ==================== FIELD CRUD OPERATIONS ====================

/**
 * Create a new field in a section
 * @param sectionId - The section ID to add the field to
 * @param fieldType - The type of field to create (e.g., 'short-answer', 'email', etc.)
 * @param question - The field question/label
 * @returns Created field
 * @throws Error if section not found or field creation fails
 */
export async function createField(
  sectionId: string,
  fieldType: string,
  question?: string
): Promise<Field> {
  try {
    // Validate section exists
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new Error("Section not found");
    }

    // Get the last field order in this section
    const lastField = await prisma.field.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // Map frontend field type to Prisma FieldType enum
    // Support both kebab-case (old) and UPPERCASE (Prisma enum)
    const fieldTypeMap: Record<string, string> = {
      // Prisma enum format (UPPERCASE_SNAKE_CASE)
      SHORT_ANSWER: "SHORT_ANSWER",
      PARAGRAPH: "PARAGRAPH",
      EMAIL: "EMAIL",
      PHONE: "PHONE",
      URL: "URL",
      NUMBER: "NUMBER",
      MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
      CHECKBOXES: "CHECKBOXES",
      DROPDOWN: "DROPDOWN",
      RATING: "RATING",
      LINEAR_SCALE: "LINEAR_SCALE",
      DATE: "DATE",
      TIME: "TIME",
      DATE_RANGE: "DATE_RANGE",
      FILE_UPLOAD: "FILE_UPLOAD",
      // Legacy kebab-case format for backwards compatibility
      "short-answer": "SHORT_ANSWER",
      paragraph: "PARAGRAPH",
      email: "EMAIL",
      phone: "PHONE",
      url: "URL",
      number: "NUMBER",
      "multiple-choice": "MULTIPLE_CHOICE",
      checkboxes: "CHECKBOXES",
      dropdown: "DROPDOWN",
      rating: "RATING",
      "linear-scale": "LINEAR_SCALE",
      date: "DATE",
      time: "TIME",
      "date-range": "DATE_RANGE",
      "file-upload": "FILE_UPLOAD",
    };

    const prismaFieldType = fieldTypeMap[fieldType] || "SHORT_ANSWER";

    // Default question based on field type
    const defaultQuestion =
      question || `Untitled ${fieldType.replace(/-|_/g, " ")}`;

    // Create default options for choice fields
    let defaultOptions = null;
    if (
      prismaFieldType === "MULTIPLE_CHOICE" ||
      prismaFieldType === "CHECKBOXES" ||
      prismaFieldType === "DROPDOWN"
    ) {
      defaultOptions = [
        { id: "opt-1", label: "Option 1", value: "option_1", default: false },
        { id: "opt-2", label: "Option 2", value: "option_2", default: false },
        { id: "opt-3", label: "Option 3", value: "option_3", default: false },
      ];
    }

    // Create the field
    return await prisma.field.create({
      data: {
        sectionId,
        question: defaultQuestion,
        type: prismaFieldType as any,
        required: false,
        order: lastField ? lastField.order + 1 : 1,
        options: defaultOptions as any,
        // Set defaults based on field type
        ...(prismaFieldType === "RATING" && {
          maxRating: 5,
          ratingStyle: "stars",
        }),
        ...(prismaFieldType === "LINEAR_SCALE" && {
          min: 1,
          max: 5,
          minLabel: "Not satisfied",
          maxLabel: "Very satisfied",
        }),
        ...(fieldType === "paragraph" && { rows: 4 }),
        ...(fieldType === "file-upload" && {
          maxFiles: 5,
          maxFileSize: 10485760, // 10MB
        }),
      },
    });
  } catch (error) {
    console.error("Failed to create field:", error);
    throw new Error("Failed to create field");
  }
}

/**
 * Update field details
 * @param fieldId - The field ID
 * @param data - Data to update (partial field properties)
 * @returns Updated field
 * @throws Error if field not found or update fails
 */
export async function updateField(
  fieldId: string,
  data: Partial<Omit<Field, "id" | "sectionId" | "createdAt" | "updatedAt">>
): Promise<Field> {
  try {
    return await prisma.field.update({
      where: { id: fieldId },
      data: {
        ...(data as any), // Type assertion needed for JsonValue fields
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update field:", error);
    throw new Error("Failed to update field");
  }
}

/**
 * Delete a field
 * @param fieldId - The field ID
 * @returns Deleted field
 * @throws Error if field not found or deletion fails
 */
export async function deleteField(fieldId: string): Promise<Field> {
  try {
    return await prisma.field.delete({
      where: { id: fieldId },
    });
  } catch (error) {
    console.error("Failed to delete field:", error);
    throw new Error("Failed to delete field");
  }
}

/**
 * Duplicate a field within the same section
 * Creates a copy of the field with all properties and new ID
 * @param fieldId - The field ID to duplicate
 * @returns The newly created field
 * @throws Error if field not found or duplication fails
 */
export async function duplicateField(fieldId: string): Promise<Field> {
  try {
    // 1. Get the original field
    const originalField = await prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!originalField) {
      throw new Error("Field not found");
    }

    // 2. Get the max order for fields in this section
    const maxOrderField = await prisma.field.findFirst({
      where: { sectionId: originalField.sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newFieldOrder = (maxOrderField?.order || 0) + 1;

    // 3. Create the duplicated field
    return await prisma.field.create({
      data: {
        sectionId: originalField.sectionId,
        question: `${originalField.question} (Copy)`,
        type: originalField.type,
        required: originalField.required,
        order: newFieldOrder,
        placeholder: originalField.placeholder,
        description: originalField.description,
        options: originalField.options || undefined,
        metadata: originalField.metadata || undefined,
        isHidden: originalField.isHidden,
        minLength: originalField.minLength,
        maxLength: originalField.maxLength,
        pattern: originalField.pattern,
        min: originalField.min,
        max: originalField.max,
        step: originalField.step,
        customValidation: originalField.customValidation || undefined,
        rows: originalField.rows,
        gridColumns: originalField.gridColumns,
        acceptedTypes: originalField.acceptedTypes,
        maxFileSize: originalField.maxFileSize,
        maxFiles: originalField.maxFiles,
        requiredFiles: originalField.requiredFiles,
        minDate: originalField.minDate,
        maxDate: originalField.maxDate,
        minTime: originalField.minTime,
        maxTime: originalField.maxTime,
        maxRating: originalField.maxRating,
        ratingStyle: originalField.ratingStyle,
        minLabel: originalField.minLabel,
        maxLabel: originalField.maxLabel,
        conditional: originalField.conditional || undefined,
      },
    });
  } catch (error) {
    console.error("Failed to duplicate field:", error);
    throw new Error("Failed to duplicate field");
  }
}

/**
 * Reorder fields within a section (batch update)
 * @param fieldOrders - Array of field IDs with new order values
 * @returns Array of updated fields
 * @throws Error if update fails
 */
export async function reorderFields(
  fieldOrders: Array<{ fieldId: string; order: number }>
): Promise<Field[]> {
  try {
    const updatePromises = fieldOrders.map(({ fieldId, order }) =>
      prisma.field.update({
        where: { id: fieldId },
        data: { order },
      })
    );

    return await Promise.all(updatePromises);
  } catch (error) {
    console.error("Failed to reorder fields:", error);
    throw new Error("Failed to reorder fields");
  }
}

/**
 * Move a field to a different section
 * @param fieldId - The field ID to move
 * @param targetSectionId - The target section ID
 * @param newOrder - Optional new order in target section (defaults to end)
 * @returns Updated field
 * @throws Error if field or section not found or move fails
 */
export async function moveFieldToSection(
  fieldId: string,
  targetSectionId: string,
  newOrder?: number
): Promise<Field> {
  try {
    // Validate target section exists
    const targetSection = await prisma.section.findUnique({
      where: { id: targetSectionId },
    });

    if (!targetSection) {
      throw new Error("Target section not found");
    }

    // If no order specified, get the last order in target section
    let order = newOrder;
    if (order === undefined) {
      const lastField = await prisma.field.findFirst({
        where: { sectionId: targetSectionId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = lastField ? lastField.order + 1 : 1;
    }

    // Move the field
    return await prisma.field.update({
      where: { id: fieldId },
      data: {
        sectionId: targetSectionId,
        order,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to move field to section:", error);
    throw new Error("Failed to move field to section");
  }
}

// ==================== THEME OPERATIONS ====================

/**
 * Get all built-in themes
 */
export async function getBuiltInThemes() {
  try {
    return await prisma.formTheme.findMany({
      where: { isBuiltIn: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch built-in themes:", error);
    throw new Error("Failed to fetch built-in themes");
  }
}

/**
 * Get all themes for a specific user
 */
export async function getUserThemes(userId: string) {
  try {
    return await prisma.formTheme.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch user themes:", error);
    throw new Error("Failed to fetch user themes");
  }
}

/**
 * Get all themes for a workspace (including built-in)
 */
export async function getWorkspaceThemes(workspaceId: string) {
  try {
    return await prisma.formTheme.findMany({
      where: {
        OR: [{ workspaceId }, { isBuiltIn: true }],
      },
      orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Failed to fetch workspace themes:", error);
    throw new Error("Failed to fetch workspace themes");
  }
}

/**
 * Get a single theme by ID
 */
export async function getThemeById(themeId: string) {
  try {
    return await prisma.formTheme.findUnique({
      where: { id: themeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        workspace: {
          select: { id: true, name: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    throw new Error("Failed to fetch theme");
  }
}

/**
 * Create a new custom theme
 */
export async function createTheme(data: {
  name: string;
  description?: string;
  category?: string;
  userId?: string;
  workspaceId?: string;
  colors: any;
  typography: any;
  layout: any;
  buttons: any;
  inputFields: any;
}) {
  try {
    return await prisma.formTheme.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category || "custom",
        userId: data.userId,
        workspaceId: data.workspaceId,
        colors: data.colors,
        typography: data.typography,
        layout: data.layout,
        buttons: data.buttons,
        inputFields: data.inputFields,
        isBuiltIn: false,
      },
    });
  } catch (error) {
    console.error("Failed to create theme:", error);
    throw new Error("Failed to create theme");
  }
}

/**
 * Update an existing theme
 */
export async function updateTheme(
  themeId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    colors?: any;
    typography?: any;
    layout?: any;
    buttons?: any;
    inputFields?: any;
  }
) {
  try {
    return await prisma.formTheme.update({
      where: { id: themeId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update theme:", error);
    throw new Error("Failed to update theme");
  }
}

/**
 * Delete a custom theme
 */
export async function deleteTheme(themeId: string) {
  try {
    // Check if theme is built-in
    const theme = await prisma.formTheme.findUnique({
      where: { id: themeId },
      select: { isBuiltIn: true },
    });

    if (theme?.isBuiltIn) {
      throw new Error("Cannot delete built-in themes");
    }

    return await prisma.formTheme.delete({
      where: { id: themeId },
    });
  } catch (error) {
    console.error("Failed to delete theme:", error);
    throw new Error("Failed to delete theme");
  }
}

/**
 * Duplicate an existing theme
 */
export async function duplicateTheme(
  themeId: string,
  newName: string,
  userId?: string,
  workspaceId?: string
) {
  try {
    const originalTheme = await prisma.formTheme.findUnique({
      where: { id: themeId },
    });

    if (!originalTheme) {
      throw new Error("Theme not found");
    }

    return await prisma.formTheme.create({
      data: {
        name: newName,
        description: originalTheme.description,
        category: originalTheme.category,
        userId,
        workspaceId,
        colors: originalTheme.colors as any,
        typography: originalTheme.typography as any,
        layout: originalTheme.layout as any,
        buttons: originalTheme.buttons as any,
        inputFields: originalTheme.inputFields as any,
        isBuiltIn: false,
      },
    });
  } catch (error) {
    console.error("Failed to duplicate theme:", error);
    throw new Error("Failed to duplicate theme");
  }
}

/**
 * Apply theme to a form
 */
export async function applyThemeToForm(formId: string, themeId: string) {
  try {
    // Update form with theme
    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        themeId,
        updatedAt: new Date(),
      },
    });

    // Increment theme usage count
    await prisma.formTheme.update({
      where: { id: themeId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return form;
  } catch (error) {
    console.error("Failed to apply theme to form:", error);
    throw new Error("Failed to apply theme to form");
  }
}

/**
 * Save custom theme overrides for a form
 */
export async function saveCustomThemeOverrides(formId: string, overrides: any) {
  try {
    return await prisma.form.update({
      where: { id: formId },
      data: {
        customTheme: overrides,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to save custom theme overrides:", error);
    throw new Error("Failed to save custom theme overrides");
  }
}

/**
 * Get complete theme for a form (base theme + custom overrides merged)
 */
export async function getFormTheme(formId: string) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        theme: true,
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    // If no theme selected, return null
    if (!form.theme) {
      return null;
    }

    // Merge base theme with custom overrides
    const baseTheme = form.theme;
    const customOverrides = form.customTheme as any;

    if (!customOverrides) {
      return baseTheme;
    }

    // Deep merge the theme with overrides
    const colors = baseTheme.colors as any;
    const typography = baseTheme.typography as any;
    const layout = baseTheme.layout as any;
    const buttons = baseTheme.buttons as any;
    const inputFields = baseTheme.inputFields as any;

    return {
      ...baseTheme,
      colors: { ...colors, ...(customOverrides.colors || {}) },
      typography: { ...typography, ...(customOverrides.typography || {}) },
      layout: { ...layout, ...(customOverrides.layout || {}) },
      buttons: { ...buttons, ...(customOverrides.buttons || {}) },
      inputFields: { ...inputFields, ...(customOverrides.inputFields || {}) },
    };
  } catch (error) {
    console.error("Failed to get form theme:", error);
    throw new Error("Failed to get form theme");
  }
}

/**
 * Reset form theme (remove theme and custom overrides)
 */
export async function resetFormTheme(formId: string) {
  try {
    return await prisma.form.update({
      where: { id: formId },
      data: {
        themeId: null,
        customTheme: null as any,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to reset form theme:", error);
    throw new Error("Failed to reset form theme");
  }
}

/**
 * Export theme to JSON format
 */
export async function exportTheme(themeId: string) {
  try {
    const theme = await prisma.formTheme.findUnique({
      where: { id: themeId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!theme) {
      throw new Error("Theme not found");
    }

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      theme: {
        name: theme.name,
        description: theme.description || "",
        category: theme.category,
        colors: theme.colors,
        typography: theme.typography,
        layout: theme.layout,
        buttons: theme.buttons,
        inputFields: theme.inputFields,
      },
      metadata: {
        author: theme.user?.name || "Fomi",
        exportedBy: theme.user?.name || "System",
      },
    };
  } catch (error) {
    console.error("Failed to export theme:", error);
    throw new Error("Failed to export theme");
  }
}

/**
 * Import theme from JSON format
 */
export async function importTheme(
  jsonData: any,
  userId?: string,
  workspaceId?: string
) {
  try {
    // Validate the import format
    if (jsonData.version !== "1.0") {
      throw new Error("Unsupported theme version");
    }

    if (!jsonData.theme) {
      throw new Error("Invalid theme format");
    }

    const themeData = jsonData.theme;

    // Create new theme from imported data
    return await prisma.formTheme.create({
      data: {
        name: themeData.name,
        description: themeData.description,
        category: themeData.category || "custom",
        userId,
        workspaceId,
        colors: themeData.colors,
        typography: themeData.typography,
        layout: themeData.layout,
        buttons: themeData.buttons,
        inputFields: themeData.inputFields,
        isBuiltIn: false,
      },
    });
  } catch (error) {
    console.error("Failed to import theme:", error);
    throw new Error("Failed to import theme");
  }
}

// ============================================================================
// WORKSPACE CRUD FUNCTIONS
// ============================================================================

/**
 * Create a new workspace
 * @param userId - ID of the user creating the workspace
 * @param name - Workspace name
 * @param description - Optional workspace description
 * @returns Newly created workspace
 */
export async function createWorkspace(
  userId: string,
  name: string,
  description?: string
) {
  try {
    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create workspace and add creator as admin in a transaction
    const workspace = await prisma.$transaction(async (tx) => {
      const newWorkspace = await tx.workspace.create({
        data: {
          name,
          slug,
          description: description || "",
          plan: "FREE",
        },
      });

      // Add creator as admin member
      await tx.workspaceMember.create({
        data: {
          workspaceId: newWorkspace.id,
          userId,
          role: "ADMIN",
        },
      });

      // Create notification for workspace creation
      await tx.notification.create({
        data: {
          userId,
          type: "WORKSPACE_CREATED",
          title: "Workspace Created",
          message: `Your workspace "${name}" has been created successfully.`,
          metadata: {
            workspaceId: newWorkspace.id,
            slug,
          },
        },
      });

      return newWorkspace;
    });

    return workspace;
  } catch (error) {
    console.error("Failed to create workspace:", error);
    throw new Error("Failed to create workspace");
  }
}

/**
 * Get all workspaces for a user
 * @param userId - ID of the user
 * @returns Array of workspaces the user is a member of
 */
export async function getUserWorkspaces(userId: string) {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                forms: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      joinedAt: m.joinedAt,
      formsCount: m.workspace._count.forms,
      membersCount: m.workspace._count.members,
    }));
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    throw new Error("Failed to fetch workspaces");
  }
}

/**
 * Get workspace by ID
 * @param workspaceId - Workspace ID
 * @param userId - User ID to verify membership
 * @returns Workspace with details
 */
export async function getWorkspaceById(workspaceId: string, userId: string) {
  try {
    // Verify user is a member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error("User is not a member of this workspace");
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            forms: true,
            invitations: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return {
      ...workspace,
      currentUserRole: member.role,
    };
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    throw error;
  }
}

/**
 * Update workspace
 * @param workspaceId - Workspace ID
 * @param userId - User ID (must be admin)
 * @param updates - Fields to update
 * @returns Updated workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    plan?: "FREE" | "PRO";
  }
) {
  try {
    // Verify user is admin
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || member.role !== "ADMIN") {
      throw new Error("Only workspace admins can update workspace settings");
    }

    // If name is being updated, generate new slug
    let slug: string | undefined;
    if (updates.name) {
      const baseSlug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique (excluding current workspace)
      while (true) {
        const existing = await prisma.workspace.findUnique({
          where: { slug },
        });
        if (!existing || existing.id === workspaceId) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...updates,
        ...(slug && { slug }),
      },
    });

    return workspace;
  } catch (error) {
    console.error("Failed to update workspace:", error);
    throw error;
  }
}

/**
 * Delete workspace
 * @param workspaceId - Workspace ID
 * @param userId - User ID (must be admin)
 */
export async function deleteWorkspace(workspaceId: string, userId: string) {
  try {
    // Verify user is admin
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || member.role !== "ADMIN") {
      throw new Error("Only workspace admins can delete the workspace");
    }

    // Delete workspace (cascade will handle related records)
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    throw error;
  }
}

/**
 * Add member to workspace
 * @param workspaceId - Workspace ID
 * @param adminUserId - Admin user ID (must be admin)
 * @param newMemberEmail - Email of user to add
 * @param role - Role to assign (default: MEMBER)
 * @returns Created workspace member
 */
export async function addWorkspaceMember(
  workspaceId: string,
  adminUserId: string,
  newMemberEmail: string,
  role: "ADMIN" | "MEMBER" = "MEMBER"
) {
  try {
    // Verify admin user
    const adminMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: adminUserId,
        },
      },
    });

    if (!adminMember || adminMember.role !== "ADMIN") {
      throw new Error("Only workspace admins can add members");
    }

    // Find user by email
    const newUser = await prisma.user.findUnique({
      where: { email: newMemberEmail },
    });

    if (!newUser) {
      throw new Error("User not found with this email");
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: newUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this workspace");
    }

    // Add member
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: newUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: "WORKSPACE_CREATED",
        title: "Added to Workspace",
        message: `You've been added to a workspace.`,
        metadata: {
          workspaceId,
        },
      },
    });

    return member;
  } catch (error) {
    console.error("Failed to add workspace member:", error);
    throw error;
  }
}

/**
 * Remove member from workspace
 * @param workspaceId - Workspace ID
 * @param adminUserId - Admin user ID (must be admin)
 * @param memberUserId - User ID to remove
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  adminUserId: string,
  memberUserId: string
) {
  try {
    // Verify admin user
    const adminMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: adminUserId,
        },
      },
    });

    if (!adminMember || adminMember.role !== "ADMIN") {
      throw new Error("Only workspace admins can remove members");
    }

    // Can't remove yourself if you're the last admin
    if (adminUserId === memberUserId) {
      const adminCount = await prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        throw new Error(
          "Cannot remove the last admin. Promote another member to admin first."
        );
      }
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove workspace member:", error);
    throw error;
  }
}

/**
 * Update member role
 * @param workspaceId - Workspace ID
 * @param adminUserId - Admin user ID (must be admin)
 * @param memberUserId - User ID to update
 * @param newRole - New role to assign
 */
export async function updateMemberRole(
  workspaceId: string,
  adminUserId: string,
  memberUserId: string,
  newRole: "ADMIN" | "MEMBER"
) {
  try {
    // Verify admin user
    const adminMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: adminUserId,
        },
      },
    });

    if (!adminMember || adminMember.role !== "ADMIN") {
      throw new Error("Only workspace admins can update member roles");
    }

    // If demoting yourself from admin, ensure at least one other admin exists
    if (adminUserId === memberUserId && newRole === "MEMBER") {
      const adminCount = await prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        throw new Error(
          "Cannot demote the last admin. Promote another member to admin first."
        );
      }
    }

    // Update role
    const updatedMember = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return updatedMember;
  } catch (error) {
    console.error("Failed to update member role:", error);
    throw error;
  }
}
