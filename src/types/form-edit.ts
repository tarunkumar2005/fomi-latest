/**
 * Type-safe definitions for Form Edit functionality
 * Uses Prisma generated types as the source of truth
 */

import type { FieldType, FormStatus } from "@/app/generated/prisma/enums";
import type {
  Field as PrismaField,
  Section as PrismaSection,
} from "@/app/generated/prisma/client";
import type { NextSectionLogic } from "./conditional-logic";

// ==================== CLOUDINARY TYPES ====================

export interface CloudinaryUploadResult {
  info: {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    [key: string]: unknown;
  };
  event: string;
}

// ==================== FIELD TYPES ====================

export interface FieldOption {
  label: string;
  value: string;
  default?: boolean;
  image?: string;
  [key: string]: unknown; // Add index signature for JsonObject compatibility
}

export interface FieldMetadata {
  [key: string]: unknown;
}

export interface CustomValidation {
  [key: string]: unknown;
}

export interface FieldConditional {
  [key: string]: unknown;
}

/**
 * Field type from Prisma with proper typings for JSON fields
 * We use Prisma's generated type as base
 */
export type Field = PrismaField;

/**
 * Partial field data for updates
 * Uses Prisma's field type for compatibility
 */
export type FieldUpdateData = Partial<
  Omit<PrismaField, "id" | "sectionId" | "createdAt" | "updatedAt">
>;

// ==================== SECTION TYPES ====================

/**
 * Section type with fields
 * Extends Prisma section and adds fields array
 */
export type Section = PrismaSection & {
  fields: Field[];
};

/**
 * Section data for updates
 * Compatible with Prisma's update input
 */
export interface SectionUpdateData {
  title?: string;
  description?: string | null;
  nextSectionLogic?: any; // JsonValue from Prisma
}

// ==================== FORM TYPES ====================

/**
 * Workspace information
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/**
 * Form header data with workspace information
 * Matches the return type from getFormHeaderByFormSlug
 */
export interface FormHeaderData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  headerImageUrl: string | null;
  workspaceId: string;
  closeDate: Date | null;
  responseLimit: number | null;
  oneResponsePerUser: boolean;
  thankYouMessage: string | null;
  workspace: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * Form settings that can be updated
 */
export interface FormSettings {
  closeDate?: Date | null;
  responseLimit?: number | null;
  oneResponsePerUser?: boolean;
  thankYouMessage?: string | null;
}

// ==================== AI ENHANCEMENT TYPES ====================

export interface AIEnhancementSuggestion {
  question?: string;
  description?: string | null;
  placeholder?: string | null;
  options?: Array<{ label: string; value: string }> | null;
  minLabel?: string | null;
  maxLabel?: string | null;
  suggestions?: string[];
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  reasoning?: string;
}

export interface AIEnhancementResult {
  success: boolean;
  data?: AIEnhancementSuggestion;
  error?: string;
}

// ==================== CONDITIONAL LOGIC HELPER TYPES ====================

export interface SectionDetailsForLogic {
  id: string;
  title: string;
  order: number;
  fields: Array<{
    id: string;
    question: string;
    type: FieldType;
    options: FieldOption[] | null;
  }>;
}

export interface ConditionalField {
  id: string;
  question: string;
  type: FieldType;
  options: any; // JsonValue from Prisma
}

export interface SectionForNavigation {
  id: string;
  title: string;
  order: number;
}

export interface CircularReferenceResult {
  hasCircularReference: boolean;
  cycles: string[][];
}

// ==================== API RESPONSE TYPES ====================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== FORM EDIT HOOK TYPES ====================

export interface UseEditFormReturn {
  // Form header state
  formHeaderData: FormHeaderData | null;
  isPublished: boolean;
  isSaved: boolean;
  isSaving: boolean;
  isLoadingHeader: boolean;
  headerError: string | null;
  hasUnsavedChanges: boolean;

  // Action loading states
  isPublishing: boolean;
  isDuplicating: boolean;
  isDeleting: boolean;

  // Form header operations
  getFormHeaderData: (slug: string) => Promise<FormHeaderData>;
  saveFormHeaderData: (slug: string, data: unknown) => Promise<void>;
  toggleFormStatus: () => Promise<void>;
  updateFormHeader: (
    title: string,
    description: string,
    headerImageUrl?: string
  ) => Promise<FormHeaderData>;
  updateFormSettings: (slug: string, settings: FormSettings) => Promise<void>;
  duplicateForm: (slug: string) => Promise<void>;
  deleteForm: (slug: string, workspaceSlug: string) => Promise<void>;

  // Section state
  sections: Section[];
  isLoadingSections: boolean;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;

  // Section operations
  loadSections: (formId: string) => Promise<void>;
  addSection: (formId: string, title?: string) => Promise<Section>;
  addSectionFromTemplate: (
    formId: string,
    templateId: string
  ) => Promise<Section>;
  updateSectionData: (
    sectionId: string,
    data: SectionUpdateData
  ) => Promise<Section>;
  removeSectionById: (sectionId: string) => Promise<void>;
  duplicateSectionById: (sectionId: string) => Promise<Section>;
  updateSectionsOrder: (sectionIds: string[]) => Promise<void>;
  updateRepeatability: (
    sectionId: string,
    isRepeatable: boolean,
    repeatCount?: number
  ) => Promise<Section>;

  // Field operations
  addField: (sectionId: string, fieldType: FieldType) => Promise<Field>;
  updateFieldData: (fieldId: string, data: FieldUpdateData) => Promise<Field>;
  removeFieldById: (fieldId: string) => Promise<void>;
  duplicateFieldById: (fieldId: string) => Promise<Field>;
  updateFieldsOrder: (sectionId: string, fieldIds: string[]) => Promise<void>;
  moveField: (
    fieldId: string,
    fromSectionId: string,
    toSectionId: string,
    newOrder: number
  ) => Promise<Field>;
  flushAllPendingUpdates: () => void;

  // AI Enhancement operations
  enhanceFieldWithAI: (
    field: Field,
    context: string
  ) => Promise<AIEnhancementResult>;
  regenerateEnhancement: (
    field: Field,
    previousSuggestion: AIEnhancementSuggestion,
    feedback: string
  ) => Promise<AIEnhancementResult>;

  // Conditional logic operations
  updateSectionNavigationLogic: (
    sectionId: string,
    logic: NextSectionLogic
  ) => Promise<Section>;
  getSectionDetails: (sectionId: string) => Promise<SectionDetailsForLogic>;
  getConditionalFieldsForSection: (
    sectionId: string
  ) => Promise<ConditionalField[]>;
  getSectionsForNavigation: (formId: string) => Promise<SectionForNavigation[]>;
  validateLogic: (
    logic: NextSectionLogic,
    sectionId: string
  ) => Promise<boolean>;
  checkCircularReferences: (
    sectionId: string,
    targetSectionId: string
  ) => Promise<CircularReferenceResult>;
}
