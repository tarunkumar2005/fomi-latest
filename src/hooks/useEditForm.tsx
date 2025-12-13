"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  saveForm,
  getFormHeaderByFormSlug,
  toggleFormStatus as toggleFormStatusPrisma,
  duplicateForm as duplicateFormPrisma,
  deleteFormBySlug,
  getFormSectionsByFormId,
  createSection,
  updateSection,
  deleteSection,
  duplicateSection,
  reorderSections,
  updateSectionRepeatability,
  updateSectionLogic,
  getSectionWithFields,
  getConditionalFields,
  getFormSectionsForNavigation,
  validateSectionLogic,
  detectCircularReferences,
  createSectionFromTemplate,
  createField,
  updateField,
  deleteField,
  duplicateField,
  reorderFields,
  moveFieldToSection,
  updateFormSettings,
} from "@/lib/prisma";
import type { NextSectionLogic } from "@/types/conditional-logic";
import type {
  Section,
  Field,
  FormHeaderData,
  FieldUpdateData,
  SectionUpdateData,
  AIEnhancementResult,
  AIEnhancementSuggestion,
  SectionDetailsForLogic,
  ConditionalField,
  SectionForNavigation,
  CircularReferenceResult,
} from "@/types/form-edit";
import type { FieldType } from "@/app/generated/prisma/enums";

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 800;

// Query keys for cache management
export const formHeaderKeys = {
  all: ["formHeader"] as const,
  bySlug: (slug: string) => [...formHeaderKeys.all, slug] as const,
};

export const formSectionKeys = {
  all: ["formSections"] as const,
  byFormId: (formId: string) => [...formSectionKeys.all, formId] as const,
};

/**
 * Main hook for form editing - maintains backward compatibility with existing usage
 * while leveraging TanStack Query for caching and state management
 */
export const useEditForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Track current slug for fetching
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);

  // Local state for active section
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // State for tracking saving - only used for UI indicators
  const [isSaving, setIsSaving] = useState(false);

  // Use refs to track state without causing re-renders during typing
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const activeSaveCount = useRef(0);
  const saveStateUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Action loading states
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce refs for field and section updates
  const fieldDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const sectionDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingFieldUpdates = useRef<Map<string, FieldUpdateData>>(new Map());
  const pendingSectionUpdates = useRef<Map<string, SectionUpdateData>>(
    new Map()
  );

  // Version tracking for optimistic locking
  const fieldUpdateVersions = useRef<Map<string, number>>(new Map());
  const sectionUpdateVersions = useRef<Map<string, number>>(new Map());

  // Helper functions for managing save state efficiently
  const startSaving = useCallback(() => {
    activeSaveCount.current += 1;
    if (!isSavingRef.current) {
      isSavingRef.current = true;
      // Debounce the UI state update to avoid flickering
      if (saveStateUpdateTimer.current) {
        clearTimeout(saveStateUpdateTimer.current);
      }
      saveStateUpdateTimer.current = setTimeout(() => {
        if (isSavingRef.current) {
          setIsSaving(true);
        }
      }, 100); // Small delay before showing "Saving..."
    }
  }, []);

  const endSaving = useCallback(() => {
    activeSaveCount.current = Math.max(0, activeSaveCount.current - 1);
    if (activeSaveCount.current === 0) {
      isSavingRef.current = false;
      // Clear any pending state update timer
      if (saveStateUpdateTimer.current) {
        clearTimeout(saveStateUpdateTimer.current);
        saveStateUpdateTimer.current = null;
      }
      // Only update state if we were showing saving
      setIsSaving(false);

      // Update unsaved changes ref based on pending updates
      const hasPending =
        pendingSectionUpdates.current.size > 0 ||
        pendingFieldUpdates.current.size > 0;
      hasUnsavedChangesRef.current = hasPending;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fieldDebounceTimers.current.forEach((timer) => clearTimeout(timer));
      fieldDebounceTimers.current.clear();
      sectionDebounceTimers.current.forEach((timer) => clearTimeout(timer));
      sectionDebounceTimers.current.clear();
      pendingFieldUpdates.current.clear();
      pendingSectionUpdates.current.clear();
      fieldUpdateVersions.current.clear();
      sectionUpdateVersions.current.clear();
      if (saveStateUpdateTimer.current) {
        clearTimeout(saveStateUpdateTimer.current);
      }
    };
  }, []);

  // ===================
  // FORM HEADER QUERY
  // ===================
  const formHeaderQuery = useQuery<FormHeaderData>({
    queryKey: formHeaderKeys.bySlug(currentSlug || ""),
    queryFn: async () => {
      if (!currentSlug) throw new Error("No slug provided");
      const data = await getFormHeaderByFormSlug(currentSlug);
      if (!data) throw new Error("Form not found");
      return data;
    },
    enabled: !!currentSlug,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Update currentFormId when header data changes
  useEffect(() => {
    if (formHeaderQuery.data?.id) {
      setCurrentFormId(formHeaderQuery.data.id);
    }
  }, [formHeaderQuery.data?.id]);

  // ===================
  // SECTIONS QUERY
  // ===================
  const sectionsQuery = useQuery<Section[]>({
    queryKey: formSectionKeys.byFormId(currentFormId || ""),
    queryFn: async () => {
      if (!currentFormId) return [];
      const fetchedSections = await getFormSectionsByFormId(currentFormId);
      return fetchedSections as Section[];
    },
    enabled: !!currentFormId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Set active section when sections are loaded
  useEffect(() => {
    if (sectionsQuery.data?.length && !activeSectionId) {
      setActiveSectionId(sectionsQuery.data[0].id);
    }
  }, [sectionsQuery.data, activeSectionId]);

  const sections = sectionsQuery.data ?? [];
  const formHeaderData = formHeaderQuery.data ?? null;
  const isPublished = formHeaderData?.status === "PUBLISHED";

  // ===================
  // FORM HEADER OPERATIONS
  // ===================

  /**
   * Fetch form header data - this sets up the current slug
   */
  async function getFormHeaderData(slug: string): Promise<FormHeaderData> {
    setCurrentSlug(slug);

    // If we already have data for this slug, return it
    const existingData = queryClient.getQueryData<FormHeaderData>(
      formHeaderKeys.bySlug(slug)
    );
    if (existingData) {
      return existingData;
    }

    // Otherwise fetch it
    const data = await getFormHeaderByFormSlug(slug);
    if (!data) {
      throw new Error("Form not found");
    }

    // Update cache
    queryClient.setQueryData(formHeaderKeys.bySlug(slug), data);
    return data;
  }

  /**
   * Update form header (title, description)
   */
  async function updateFormHeader(
    slug: string,
    title: string,
    description: string,
    headerImageUrl?: string
  ): Promise<void> {
    setIsSaving(true);
    try {
      await saveForm(slug, { title, description, headerImageUrl });

      // Update cache
      queryClient.setQueryData<FormHeaderData>(
        formHeaderKeys.bySlug(slug),
        (old) =>
          old
            ? {
                ...old,
                title,
                description,
                headerImageUrl:
                  headerImageUrl !== undefined
                    ? headerImageUrl
                    : old.headerImageUrl,
              }
            : old
      );
    } catch (error) {
      console.error("Failed to update form header:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Save form data (legacy - keeping for compatibility)
   */
  async function saveFormHeaderData(
    slug: string,
    data: { title?: string; description?: string }
  ): Promise<void> {
    setIsSaving(true);
    try {
      await saveForm(slug, data);

      // Update cache
      queryClient.setQueryData<FormHeaderData>(
        formHeaderKeys.bySlug(slug),
        (old) => (old ? { ...old, ...data } : old)
      );
    } catch (error) {
      console.error("Failed to save form:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update form settings
   */
  async function updateFormSettingsHandler(
    slug: string,
    settings: {
      closeDate?: Date | null;
      responseLimit?: number | null;
      oneResponsePerUser?: boolean;
      thankYouMessage?: string | null;
    }
  ): Promise<void> {
    setIsSaving(true);
    try {
      await updateFormSettings(slug, settings);

      // Update cache
      queryClient.setQueryData<FormHeaderData>(
        formHeaderKeys.bySlug(slug),
        (old) => (old ? { ...old, ...settings } : old)
      );
    } catch (error) {
      console.error("Failed to update form settings:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Toggle form publish status
   */
  async function toggleFormStatusHandler(slug: string): Promise<void> {
    setIsPublishing(true);
    try {
      const newStatus = isPublished ? "DRAFT" : "PUBLISHED";
      await toggleFormStatusPrisma(slug, newStatus);

      // Update cache
      queryClient.setQueryData<FormHeaderData>(
        formHeaderKeys.bySlug(slug),
        (old) => (old ? { ...old, status: newStatus } : old)
      );
    } catch (error) {
      console.error("Failed to toggle form status:", error);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }

  /**
   * Duplicate form
   */
  async function duplicateFormHandler(
    formId: string,
    workspaceId: string,
    userId: string
  ): Promise<void> {
    setIsDuplicating(true);
    try {
      const newForm = await duplicateFormPrisma(formId, workspaceId, userId);
      router.push(`/forms/${newForm.slug}/edit`);
    } catch (error) {
      console.error("Failed to duplicate form:", error);
      throw error;
    } finally {
      setIsDuplicating(false);
    }
  }

  /**
   * Delete form
   */
  async function deleteFormHandler(
    slug: string,
    workspaceSlug: string
  ): Promise<void> {
    setIsDeleting(true);
    try {
      await deleteFormBySlug(slug);
      queryClient.removeQueries({ queryKey: formHeaderKeys.bySlug(slug) });
      router.push(`/dashboard/${workspaceSlug}`);
    } catch (error) {
      console.error("Failed to delete form:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }

  // ===================
  // SECTION OPERATIONS
  // ===================

  /**
   * Load all sections for a form
   */
  async function loadSections(formId: string): Promise<Section[]> {
    setCurrentFormId(formId);

    // If we already have data, return it
    const existingData = queryClient.getQueryData<Section[]>(
      formSectionKeys.byFormId(formId)
    );
    if (existingData) {
      if (!activeSectionId && existingData.length > 0) {
        setActiveSectionId(existingData[0].id);
      }
      return existingData;
    }

    // Otherwise fetch
    const fetchedSections = await getFormSectionsByFormId(formId);
    const typedSections = fetchedSections as Section[];

    queryClient.setQueryData(formSectionKeys.byFormId(formId), typedSections);

    if (!activeSectionId && typedSections.length > 0) {
      setActiveSectionId(typedSections[0].id);
    }

    return typedSections;
  }

  /**
   * Add a new section to the form
   */
  async function addSection(
    formId: string,
    title: string = "Untitled Section",
    description: string = ""
  ): Promise<Section> {
    setIsSaving(true);
    try {
      const newSection = await createSection(formId, title, description);
      const sectionWithFields = { ...newSection, fields: [] };

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(formId),
        (old) => [...(old || []), sectionWithFields]
      );

      setActiveSectionId(newSection.id);
      return sectionWithFields;
    } catch (error) {
      console.error("Failed to add section:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update section details (with debouncing)
   */
  const updateSectionData = useCallback(
    (sectionId: string, data: SectionUpdateData): Promise<Section> => {
      // If updating logic, do it immediately (not debounced)
      if (data.nextSectionLogic !== undefined) {
        return (async () => {
          startSaving();
          try {
            const updatedSection = await updateSection(sectionId, data);
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentSection = currentSections.find(
              (s) => s.id === sectionId
            );
            const sectionWithFields = {
              ...updatedSection,
              fields: currentSection?.fields || [],
            };

            queryClient.setQueryData<Section[]>(
              formSectionKeys.byFormId(currentFormId || ""),
              (old) =>
                (old || []).map((section) =>
                  section.id === sectionId
                    ? { ...section, ...updatedSection }
                    : section
                )
            );

            return sectionWithFields;
          } catch (error) {
            console.error("Failed to update section:", error);
            throw error;
          } finally {
            endSaving();
          }
        })();
      }

      // Increment version for this section update
      const currentVersion =
        (sectionUpdateVersions.current.get(sectionId) || 0) + 1;
      sectionUpdateVersions.current.set(sectionId, currentVersion);

      // Merge with any pending updates for this section
      const existingPending =
        pendingSectionUpdates.current.get(sectionId) || {};
      const mergedData = { ...existingPending, ...data };

      pendingSectionUpdates.current.set(sectionId, mergedData);

      // Set unsaved changes flag (ref-based to avoid re-renders)
      hasUnsavedChangesRef.current = true;

      // Optimistic update for immediate UI feedback
      const isSimpleTextUpdate =
        Object.keys(data).length === 1 &&
        (data.title !== undefined || data.description !== undefined);

      if (!isSimpleTextUpdate) {
        queryClient.setQueryData<Section[]>(
          formSectionKeys.byFormId(currentFormId || ""),
          (old) =>
            (old || []).map((section) =>
              section.id === sectionId ? { ...section, ...mergedData } : section
            )
        );
      }

      // Clear existing timer for this section
      const existingTimer = sectionDebounceTimers.current.get(sectionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      return new Promise((resolve, reject) => {
        const dataSnapshot = { ...mergedData };
        const versionSnapshot = currentVersion;

        const timer = setTimeout(async () => {
          const latestVersion = sectionUpdateVersions.current.get(sectionId);
          if (latestVersion !== versionSnapshot) {
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentSection = currentSections.find(
              (s) => s.id === sectionId
            );
            if (currentSection) resolve(currentSection);
            return;
          }

          const dataToSave = pendingSectionUpdates.current.get(sectionId);
          if (!dataToSave) {
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentSection = currentSections.find(
              (s) => s.id === sectionId
            );
            if (currentSection) resolve(currentSection);
            return;
          }

          pendingSectionUpdates.current.delete(sectionId);
          sectionDebounceTimers.current.delete(sectionId);

          startSaving();
          try {
            const updatedSection = await updateSection(sectionId, dataSnapshot);
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentSection = currentSections.find(
              (s) => s.id === sectionId
            );
            const sectionWithFields = {
              ...updatedSection,
              fields: currentSection?.fields || [],
            };

            // Only update cache AFTER successful save
            queryClient.setQueryData<Section[]>(
              formSectionKeys.byFormId(currentFormId || ""),
              (old) =>
                (old || []).map((section) =>
                  section.id === sectionId ? sectionWithFields : section
                )
            );

            resolve(sectionWithFields);
          } catch (error) {
            console.error("Failed to update section:", error);
            toast.error("Failed to save section changes", {
              description:
                error instanceof Error
                  ? error.message
                  : "Your changes could not be saved. Please try again.",
            });
            pendingSectionUpdates.current.set(sectionId, dataSnapshot);
            reject(error);
          } finally {
            endSaving();
          }
        }, DEBOUNCE_DELAY);

        sectionDebounceTimers.current.set(sectionId, timer);
      });
    },
    [currentFormId, queryClient, startSaving, endSaving]
  );

  /**
   * Delete a section
   */
  async function removeSectionById(sectionId: string): Promise<void> {
    // Cancel any pending updates
    const timer = sectionDebounceTimers.current.get(sectionId);
    if (timer) {
      clearTimeout(timer);
      sectionDebounceTimers.current.delete(sectionId);
    }
    pendingSectionUpdates.current.delete(sectionId);
    sectionUpdateVersions.current.delete(sectionId);

    setIsSaving(true);
    try {
      await deleteSection(sectionId);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) => (old || []).filter((section) => section.id !== sectionId)
      );

      if (activeSectionId === sectionId) {
        const remaining = sections.filter((s) => s.id !== sectionId);
        setActiveSectionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error("Failed to delete section:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Duplicate a section
   */
  async function duplicateSectionById(sectionId: string): Promise<void> {
    // Flush any pending updates first
    const pendingData = pendingSectionUpdates.current.get(sectionId);
    if (pendingData) {
      const timer = sectionDebounceTimers.current.get(sectionId);
      if (timer) clearTimeout(timer);
      sectionDebounceTimers.current.delete(sectionId);
      pendingSectionUpdates.current.delete(sectionId);
      await updateSection(sectionId, pendingData);
    }

    setIsSaving(true);
    try {
      const duplicatedSection = await duplicateSection(sectionId);
      const newSection: Section = {
        ...duplicatedSection,
        fields: duplicatedSection.fields as Field[],
      };

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) => [...(old || []), newSection]
      );

      setActiveSectionId(newSection.id);
    } catch (error) {
      console.error("Failed to duplicate section:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Reorder sections
   */
  async function updateSectionsOrder(
    sectionOrders: Array<{ sectionId: string; order: number }>
  ): Promise<void> {
    setIsSaving(true);
    try {
      // Optimistic update
      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || [])
            .map((section) => {
              const updatedOrder = sectionOrders.find(
                (so) => so.sectionId === section.id
              )?.order;
              return updatedOrder !== undefined
                ? { ...section, order: updatedOrder }
                : section;
            })
            .sort((a, b) => a.order - b.order)
      );

      await reorderSections(sectionOrders);
    } catch (error) {
      console.error("Failed to reorder sections:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update section repeatability
   */
  async function updateRepeatability(
    sectionId: string,
    isRepeatable: boolean,
    repeatCount?: number
  ): Promise<void> {
    setIsSaving(true);
    try {
      const updatedSection = await updateSectionRepeatability(
        sectionId,
        isRepeatable,
        repeatCount
      );

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  isRepeatable: updatedSection.isRepeatable,
                  repeatCount: updatedSection.repeatCount,
                }
              : section
          )
      );
    } catch (error) {
      console.error("Failed to update section repeatability:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Create section from template
   */
  async function addSectionFromTemplate(
    formId: string,
    templateId: string
  ): Promise<any> {
    setIsSaving(true);
    try {
      const newSection = await createSectionFromTemplate(formId, templateId);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(formId),
        (old) => [
          ...(old || []),
          { ...newSection, fields: newSection.fields || [] } as Section,
        ]
      );

      setActiveSectionId(newSection.id);
      return newSection;
    } catch (error) {
      console.error("Failed to create section from template:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  function getActiveSection() {
    return sections.find((section) => section.id === activeSectionId) || null;
  }

  function getAllFields(): Field[] {
    return sections.flatMap((section) => section.fields);
  }

  // ===================
  // FIELD OPERATIONS
  // ===================

  /**
   * Add a new field to a section
   */
  async function addField(
    sectionId: string,
    fieldType: FieldType,
    question?: string
  ): Promise<Field> {
    setIsSaving(true);
    try {
      const newField = await createField(sectionId, fieldType, question);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) =>
            section.id === sectionId
              ? { ...section, fields: [...section.fields, newField as Field] }
              : section
          )
      );

      return newField;
    } catch (error) {
      console.error("Failed to add field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update field details (with debouncing)
   * For bulk updates (like AI enhancements), we do optimistic cache updates.
   * For single-field text updates (typing), local state handles the immediate feedback.
   */
  const updateFieldData = useCallback(
    (fieldId: string, data: FieldUpdateData): Promise<Field> => {
      const currentVersion =
        (fieldUpdateVersions.current.get(fieldId) || 0) + 1;
      fieldUpdateVersions.current.set(fieldId, currentVersion);

      const existingPending = pendingFieldUpdates.current.get(fieldId) || {};
      const mergedData = { ...existingPending, ...data };

      pendingFieldUpdates.current.set(fieldId, mergedData);

      // Set unsaved changes flag (ref-based to avoid re-renders)
      hasUnsavedChangesRef.current = true;

      // Do optimistic update for non-text fields or bulk updates (AI enhancements)
      // Skip for simple text fields to avoid lag on typing
      const isSimpleTextUpdate =
        Object.keys(data).length === 1 &&
        (data.question !== undefined ||
          data.description !== undefined ||
          data.placeholder !== undefined);

      if (!isSimpleTextUpdate) {
        queryClient.setQueryData<Section[]>(
          formSectionKeys.byFormId(currentFormId || ""),
          (old) =>
            (old || []).map((section) => ({
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, ...mergedData } : field
              ),
            }))
        );
      }

      const existingTimer = fieldDebounceTimers.current.get(fieldId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      return new Promise((resolve, reject) => {
        const dataSnapshot = { ...mergedData };
        const versionSnapshot = currentVersion;

        const timer = setTimeout(async () => {
          const latestVersion = fieldUpdateVersions.current.get(fieldId);
          if (latestVersion !== versionSnapshot) {
            // Another update came in, skip this one
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentField = currentSections
              .flatMap((s) => s.fields)
              .find((f) => f.id === fieldId);
            resolve(currentField!);
            return;
          }

          const dataToSave = pendingFieldUpdates.current.get(fieldId);
          if (!dataToSave) {
            const currentSections =
              queryClient.getQueryData<Section[]>(
                formSectionKeys.byFormId(currentFormId || "")
              ) || [];
            const currentField = currentSections
              .flatMap((s) => s.fields)
              .find((f) => f.id === fieldId);
            resolve(currentField!);
            return;
          }

          pendingFieldUpdates.current.delete(fieldId);
          fieldDebounceTimers.current.delete(fieldId);

          startSaving();
          try {
            const updatedField = await updateField(fieldId, dataSnapshot);

            // Only update cache AFTER successful save
            queryClient.setQueryData<Section[]>(
              formSectionKeys.byFormId(currentFormId || ""),
              (old) =>
                (old || []).map((section) => ({
                  ...section,
                  fields: section.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...updatedField } : field
                  ),
                }))
            );

            resolve(updatedField);
          } catch (error) {
            console.error("Failed to update field:", error);
            toast.error("Failed to save field changes", {
              description:
                error instanceof Error
                  ? error.message
                  : "Your changes could not be saved. Please try again.",
            });
            pendingFieldUpdates.current.set(fieldId, dataSnapshot);
            reject(error);
          } finally {
            endSaving();
          }
        }, DEBOUNCE_DELAY);

        fieldDebounceTimers.current.set(fieldId, timer);
      });
    },
    [currentFormId, queryClient, startSaving, endSaving]
  );

  /**
   * Delete a field
   */
  async function removeFieldById(fieldId: string): Promise<void> {
    const timer = fieldDebounceTimers.current.get(fieldId);
    if (timer) {
      clearTimeout(timer);
      fieldDebounceTimers.current.delete(fieldId);
    }
    pendingFieldUpdates.current.delete(fieldId);
    fieldUpdateVersions.current.delete(fieldId);

    setIsSaving(true);
    try {
      await deleteField(fieldId);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) => ({
            ...section,
            fields: section.fields.filter((field) => field.id !== fieldId),
          }))
      );
    } catch (error) {
      console.error("Failed to delete field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Duplicate a field
   */
  async function duplicateFieldById(fieldId: string): Promise<void> {
    const pendingData = pendingFieldUpdates.current.get(fieldId);
    if (pendingData) {
      const timer = fieldDebounceTimers.current.get(fieldId);
      if (timer) clearTimeout(timer);
      fieldDebounceTimers.current.delete(fieldId);
      pendingFieldUpdates.current.delete(fieldId);
      await updateField(fieldId, pendingData);
    }

    setIsSaving(true);
    try {
      const duplicatedField = await duplicateField(fieldId);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) => {
            const hasOriginalField = section.fields.some(
              (field) => field.id === fieldId
            );
            if (hasOriginalField) {
              return {
                ...section,
                fields: [...section.fields, duplicatedField as Field],
              };
            }
            return section;
          })
      );
    } catch (error) {
      console.error("Failed to duplicate field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Reorder fields
   */
  async function updateFieldsOrder(
    fieldOrders: Array<{ fieldId: string; order: number }>
  ): Promise<void> {
    setIsSaving(true);
    try {
      // Optimistic update
      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) => ({
            ...section,
            fields: section.fields
              .map((field) => {
                const newOrder = fieldOrders.find(
                  (fo) => fo.fieldId === field.id
                );
                return newOrder ? { ...field, order: newOrder.order } : field;
              })
              .sort((a, b) => a.order - b.order),
          }))
      );

      await reorderFields(fieldOrders);
    } catch (error) {
      console.error("Failed to reorder fields:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Move a field to a different section
   */
  async function moveField(
    fieldId: string,
    targetSectionId: string,
    newOrder?: number
  ): Promise<void> {
    setIsSaving(true);
    try {
      const movedField = await moveFieldToSection(
        fieldId,
        targetSectionId,
        newOrder
      );

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) => {
            const fieldsWithoutMoved = section.fields.filter(
              (field) => field.id !== fieldId
            );

            if (section.id === targetSectionId) {
              return {
                ...section,
                fields: [...fieldsWithoutMoved, movedField as Field].sort(
                  (a, b) => a.order - b.order
                ),
              };
            }

            return { ...section, fields: fieldsWithoutMoved };
          })
      );
    } catch (error) {
      console.error("Failed to move field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  // ===================
  // AI ENHANCE OPERATIONS
  // ===================

  async function enhanceFieldWithAI(
    field: Field,
    sectionTitle?: string
  ): Promise<AIEnhancementResult> {
    try {
      const { enhanceField } = await import("@/lib/agent");

      const validFieldTypes = [
        "SHORT_ANSWER",
        "PARAGRAPH",
        "EMAIL",
        "PHONE",
        "URL",
        "NUMBER",
        "MULTIPLE_CHOICE",
        "CHECKBOXES",
        "DROPDOWN",
        "RATING",
        "LINEAR_SCALE",
        "DATE",
        "DATE_RANGE",
        "TIME",
        "FILE_UPLOAD",
      ];

      const normalizedType = field.type?.toUpperCase().replace(/-/g, "_");
      const fieldType = validFieldTypes.includes(normalizedType)
        ? normalizedType
        : "SHORT_ANSWER";

      const result = await enhanceField({
        fieldType,
        currentField: {
          question: field.question,
          description: field.description,
          placeholder: field.placeholder,
          options: field.options as any,
          minLabel: field.minLabel,
          maxLabel: field.maxLabel,
        },
        formContext: formHeaderData
          ? {
              title: formHeaderData.title,
              description: formHeaderData.description,
            }
          : undefined,
        sectionTitle,
      });

      return result;
    } catch (error) {
      console.error("Failed to enhance field:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Enhancement failed",
      };
    }
  }

  async function regenerateEnhancement(
    field: Field,
    previousSuggestion: AIEnhancementSuggestion | undefined,
    feedback?: string,
    sectionTitle?: string
  ): Promise<AIEnhancementResult> {
    try {
      const { regenerateEnhancement: regenerate } = await import("@/lib/agent");

      const validFieldTypes = [
        "SHORT_ANSWER",
        "PARAGRAPH",
        "EMAIL",
        "PHONE",
        "URL",
        "NUMBER",
        "MULTIPLE_CHOICE",
        "CHECKBOXES",
        "DROPDOWN",
        "RATING",
        "LINEAR_SCALE",
        "DATE",
        "DATE_RANGE",
        "TIME",
        "FILE_UPLOAD",
      ];

      const normalizedType = field.type?.toUpperCase().replace(/-/g, "_");
      const fieldType = validFieldTypes.includes(normalizedType)
        ? normalizedType
        : "SHORT_ANSWER";

      if (!previousSuggestion) {
        return {
          success: false,
          error: "No previous suggestion to regenerate from",
        };
      }

      const convertedSuggestion = {
        question: previousSuggestion.question || field.question,
        description: previousSuggestion.description || null,
        placeholder: previousSuggestion.placeholder || null,
        options: previousSuggestion.options || null,
        minLabel: previousSuggestion.minLabel || null,
        maxLabel: previousSuggestion.maxLabel || null,
        suggestions: previousSuggestion.suggestions || [],
      };

      const result = await regenerate(
        {
          fieldType,
          currentField: {
            question: field.question,
            description: field.description,
            placeholder: field.placeholder,
            options: field.options as any,
            minLabel: field.minLabel,
            maxLabel: field.maxLabel,
          },
          formContext: formHeaderData
            ? {
                title: formHeaderData.title,
                description: formHeaderData.description,
              }
            : undefined,
          sectionTitle,
        },
        convertedSuggestion,
        feedback
      );

      return result;
    } catch (error) {
      console.error("Failed to regenerate enhancement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Regeneration failed",
      };
    }
  }

  // ===================
  // CONDITIONAL LOGIC OPERATIONS
  // ===================

  async function updateSectionNavigationLogic(
    sectionId: string,
    logic: NextSectionLogic
  ): Promise<Section> {
    setIsSaving(true);
    try {
      const updatedSection = await updateSectionLogic(sectionId, logic);
      const currentSection = sections.find((s) => s.id === sectionId);

      queryClient.setQueryData<Section[]>(
        formSectionKeys.byFormId(currentFormId || ""),
        (old) =>
          (old || []).map((section) =>
            section.id === sectionId
              ? { ...section, nextSectionLogic: logic as any }
              : section
          )
      );

      return { ...updatedSection, fields: currentSection?.fields || [] };
    } catch (error) {
      console.error("Failed to update section logic:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function getSectionDetails(
    sectionId: string
  ): Promise<SectionDetailsForLogic> {
    const section = await getSectionWithFields(sectionId);
    if (!section) throw new Error("Section not found");
    return section as SectionDetailsForLogic;
  }

  async function getConditionalFieldsForSection(
    sectionId: string
  ): Promise<ConditionalField[]> {
    try {
      return await getConditionalFields(sectionId);
    } catch (error) {
      console.error("Failed to get conditional fields:", error);
      return [];
    }
  }

  async function getSectionsForNavigation(
    formId: string
  ): Promise<SectionForNavigation[]> {
    try {
      return await getFormSectionsForNavigation(formId);
    } catch (error) {
      console.error("Failed to get sections for navigation:", error);
      return [];
    }
  }

  async function validateLogic(
    formId: string,
    sectionId: string,
    logic: NextSectionLogic
  ): Promise<{ valid: boolean; errors: string[] }> {
    try {
      return await validateSectionLogic(formId, sectionId, logic);
    } catch (error) {
      console.error("Failed to validate section logic:", error);
      return { valid: false, errors: ["Validation failed"] };
    }
  }

  async function checkCircularReferences(
    formId: string
  ): Promise<CircularReferenceResult> {
    try {
      return await detectCircularReferences(formId);
    } catch (error) {
      console.error("Failed to check circular references:", error);
      return { hasCircularReference: false, cycles: [] };
    }
  }

  // ===================
  // FLUSH PENDING UPDATES
  // ===================

  const flushAllPendingUpdates = useCallback(async () => {
    const pendingFieldEntries = Array.from(
      pendingFieldUpdates.current.entries()
    );
    const pendingSectionEntries = Array.from(
      pendingSectionUpdates.current.entries()
    );

    if (
      pendingFieldEntries.length === 0 &&
      pendingSectionEntries.length === 0
    ) {
      return;
    }

    fieldDebounceTimers.current.forEach((timer) => clearTimeout(timer));
    fieldDebounceTimers.current.clear();
    sectionDebounceTimers.current.forEach((timer) => clearTimeout(timer));
    sectionDebounceTimers.current.clear();

    setIsSaving(true);
    try {
      await Promise.all([
        ...pendingFieldEntries.map(([fieldId, data]) =>
          updateField(fieldId, data)
        ),
        ...pendingSectionEntries.map(([sectionId, data]) =>
          updateSection(sectionId, data)
        ),
      ]);
      pendingFieldUpdates.current.clear();
      pendingSectionUpdates.current.clear();
      hasUnsavedChangesRef.current = false;
    } catch (error) {
      console.error("Failed to flush pending updates:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Computed state - use ref for hasUnsavedChanges to avoid re-renders
  // The beforeunload handler will check the ref directly
  const isSaved = !isSaving && !hasUnsavedChangesRef.current;

  // Getter function for hasUnsavedChanges (to be used in beforeunload)
  const getHasUnsavedChanges = useCallback(
    () => hasUnsavedChangesRef.current,
    []
  );

  return {
    // Form header operations
    getFormHeaderData,
    updateFormHeader,
    formHeaderData,
    saveFormHeaderData,
    updateFormSettings: updateFormSettingsHandler,

    // Form-level operations
    toggleFormStatus: toggleFormStatusHandler,
    isPublished,
    isSaved,
    isSaving,
    isLoadingHeader: formHeaderQuery.isLoading,
    headerError: formHeaderQuery.error?.message ?? null,
    hasUnsavedChanges: hasUnsavedChangesRef.current, // For backwards compatibility
    getHasUnsavedChanges, // Function to get current value
    isPublishing,
    isDuplicating,
    isDeleting,
    duplicateForm: duplicateFormHandler,
    deleteForm: deleteFormHandler,

    // Section operations
    sections,
    activeSectionId,
    setActiveSectionId,
    isLoadingSections: sectionsQuery.isLoading,
    loadSections,
    addSection,
    addSectionFromTemplate,
    updateSectionData,
    removeSectionById,
    duplicateSectionById,
    updateSectionsOrder,
    updateRepeatability,
    getActiveSection,
    getAllFields,

    // Field operations
    addField,
    updateFieldData,
    removeFieldById,
    duplicateFieldById,
    updateFieldsOrder,
    moveField,
    flushAllPendingUpdates,

    // AI Enhance operations
    enhanceFieldWithAI,
    regenerateEnhancement,

    // Conditional logic operations
    updateSectionNavigationLogic,
    getSectionDetails,
    getConditionalFieldsForSection,
    getSectionsForNavigation,
    validateLogic,
    checkCircularReferences,
  };
};
