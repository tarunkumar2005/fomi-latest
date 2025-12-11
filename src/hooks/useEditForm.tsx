"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import { useRouter } from "next/navigation";

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 800;

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  nextSectionLogic: any;
  isRepeatable?: boolean;
  repeatCount?: number | null;
  fields: Field[];
}

interface Field {
  id: string;
  sectionId: string;
  type: string;
  question: string;
  order: number;
  // ...other field properties
}

export const useEditForm = () => {
  const router = useRouter();

  const [formHeaderData, setFormHeaderData] = useState<any>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Debounce refs for field and section updates
  const fieldDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const sectionDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingFieldUpdates = useRef<Map<string, Partial<Field>>>(new Map());
  const pendingSectionUpdates = useRef<Map<string, any>>(new Map());
  
  // Version tracking for optimistic locking
  const fieldUpdateVersions = useRef<Map<string, number>>(new Map());
  const sectionUpdateVersions = useRef<Map<string, number>>(new Map());

  // Cleanup all debounce timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear all field debounce timers
      fieldDebounceTimers.current.forEach((timer) => clearTimeout(timer));
      fieldDebounceTimers.current.clear();

      // Clear all section debounce timers
      sectionDebounceTimers.current.forEach((timer) => clearTimeout(timer));
      sectionDebounceTimers.current.clear();

      // Clear pending updates maps
      pendingFieldUpdates.current.clear();
      pendingSectionUpdates.current.clear();
      
      // Clear version tracking
      fieldUpdateVersions.current.clear();
      sectionUpdateVersions.current.clear();
    };
  }, []);

  /**
   * Fetch form header data
   */
  async function getFormHeaderData(slug: string): Promise<any> {
    const data = await getFormHeaderByFormSlug(slug);
    console.log("Form Header Data", data);
    setFormHeaderData(data);
    setIsPublished(data?.status === "PUBLISHED");
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
    setIsSaved(false);
    try {
      await saveForm(slug, { title, description, headerImageUrl });
      setFormHeaderData((prev: any) => ({
        ...prev,
        title,
        description,
        headerImageUrl:
          headerImageUrl !== undefined ? headerImageUrl : prev.headerImageUrl,
      }));
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to update form header:", error);
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
    setIsSaved(false);
    try {
      await saveForm(slug, data);
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save form:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update form settings (close date, response limit, etc.)
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
    setIsSaved(false);
    try {
      await updateFormSettings(slug, settings);
      setFormHeaderData((prev: any) => ({
        ...prev,
        ...settings,
      }));
      setIsSaved(true);
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
    try {
      const newStatus = isPublished ? "DRAFT" : "PUBLISHED";
      await toggleFormStatusPrisma(slug, newStatus);
      setIsPublished(!isPublished);
    } catch (error) {
      console.error("Failed to toggle form status:", error);
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
    try {
      const newForm = await duplicateFormPrisma(formId, workspaceId, userId);
      router.push(`/forms/${newForm.slug}/edit`);
    } catch (error) {
      console.error("Failed to duplicate form:", error);
    }
  }

  /**
   * Delete form
   */
  async function deleteFormHandler(
    slug: string,
    workspaceSlug: string
  ): Promise<void> {
    try {
      await deleteFormBySlug(slug);
      router.push(`/dashboard/${workspaceSlug}`);
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  }

  /**
   * Load all sections for a form
   */
  async function loadSections(formId: string): Promise<Section[]> {
    setIsLoadingSections(true);
    try {
      const fetchedSections = await getFormSectionsByFormId(formId);
      setSections(fetchedSections as Section[]);

      if (!activeSectionId && fetchedSections.length > 0) {
        setActiveSectionId(fetchedSections[0].id);
      }

      return fetchedSections as Section[];
    } catch (error) {
      console.error("Failed to load sections:", error);
      return [];
    } finally {
      setIsLoadingSections(false);
    }
  }

  /**
   * Add a new section to the form
   */
  async function addSection(
    formId: string,
    title: string = "Untitled Section",
    description: string = ""
  ): Promise<any> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const newSection = await createSection(formId, title, description);

      setSections((prev) => [
        ...prev,
        { ...newSection, fields: [] } as Section,
      ]);
      setActiveSectionId(newSection.id);
      setIsSaved(true);
      return newSection;
    } catch (error) {
      console.error("Failed to add section:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update section details (with debouncing for title/description)
   * Uses optimistic locking to prevent race conditions
   */
  const updateSectionData = useCallback(
    (
      sectionId: string,
      data: {
        title?: string;
        description?: string;
        nextSectionLogic?: any;
      }
    ): Promise<any> => {
      // If updating logic, do it immediately (not debounced)
      if (data.nextSectionLogic !== undefined) {
        return (async () => {
          setIsSaving(true);
          setIsSaved(false);
          try {
            const updatedSection = await updateSection(sectionId, data);
            setSections((prev) =>
              prev.map((section) =>
                section.id === sectionId
                  ? { ...section, ...updatedSection }
                  : section
              )
            );
            setIsSaved(true);
            return updatedSection;
          } catch (error) {
            console.error("Failed to update section:", error);
            throw error;
          } finally {
            setIsSaving(false);
          }
        })();
      }

      // Increment version for this section update
      const currentVersion = (sectionUpdateVersions.current.get(sectionId) || 0) + 1;
      sectionUpdateVersions.current.set(sectionId, currentVersion);

      // Update local state immediately (optimistic update)
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? { ...section, ...data } : section
        )
      );

      // Mark as unsaved
      setIsSaved(false);

      // Merge with any pending updates for this section
      const existingPending =
        pendingSectionUpdates.current.get(sectionId) || {};
      const mergedData = { ...existingPending, ...data };
      pendingSectionUpdates.current.set(sectionId, mergedData);

      // Clear existing timer for this section
      const existingTimer = sectionDebounceTimers.current.get(sectionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Return a promise that resolves when the debounced save completes
      return new Promise((resolve, reject) => {
        // Capture the data snapshot at this moment (closure)
        const dataSnapshot = { ...mergedData };
        const versionSnapshot = currentVersion;

        const timer = setTimeout(async () => {
          // Check if this is still the latest version
          const latestVersion = sectionUpdateVersions.current.get(sectionId);
          if (latestVersion !== versionSnapshot) {
            // A newer update has been scheduled, skip this one
            resolve(null);
            return;
          }

          // Double-check that we still have pending data
          const dataToSave = pendingSectionUpdates.current.get(sectionId);
          if (!dataToSave) {
            resolve(null);
            return;
          }

          // Clear pending updates for this section
          pendingSectionUpdates.current.delete(sectionId);
          sectionDebounceTimers.current.delete(sectionId);

          setIsSaving(true);
          try {
            // Use the snapshot data, not the current ref value
            const updatedSection = await updateSection(sectionId, dataSnapshot);
            setIsSaved(true);
            resolve(updatedSection);
          } catch (error) {
            console.error("Failed to update section:", error);
            
            // On error, restore the pending update so it can be retried
            pendingSectionUpdates.current.set(sectionId, dataSnapshot);
            
            reject(error);
          } finally {
            setIsSaving(false);
          }
        }, DEBOUNCE_DELAY);

        sectionDebounceTimers.current.set(sectionId, timer);
      });
    },
    []
  );

  /**
   * Delete a section
   */
  async function removeSectionById(sectionId: string): Promise<void> {
    // Cancel any pending updates for this section
    const timer = sectionDebounceTimers.current.get(sectionId);
    if (timer) {
      clearTimeout(timer);
      sectionDebounceTimers.current.delete(sectionId);
    }
    pendingSectionUpdates.current.delete(sectionId);
    sectionUpdateVersions.current.delete(sectionId);

    setIsSaving(true);
    setIsSaved(false);
    try {
      await deleteSection(sectionId);

      setSections((prev) => prev.filter((section) => section.id !== sectionId));
      if (activeSectionId === sectionId) {
        setActiveSectionId(sections.length > 0 ? sections[0].id : null);
      }
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to delete section:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Duplicate a section with all its fields
   */
  async function duplicateSectionById(sectionId: string): Promise<void> {
    // Flush any pending updates for this section before duplicating
    const pendingData = pendingSectionUpdates.current.get(sectionId);
    if (pendingData) {
      const timer = sectionDebounceTimers.current.get(sectionId);
      if (timer) clearTimeout(timer);
      sectionDebounceTimers.current.delete(sectionId);
      pendingSectionUpdates.current.delete(sectionId);
      await updateSection(sectionId, pendingData);
    }

    setIsSaving(true);
    setIsSaved(false);
    try {
      const duplicatedSection = await duplicateSection(sectionId);

      // Transform to match Section interface
      const newSection: Section = {
        id: duplicatedSection.id,
        title: duplicatedSection.title,
        description: duplicatedSection.description,
        order: duplicatedSection.order,
        nextSectionLogic: duplicatedSection.nextSectionLogic,
        fields: duplicatedSection.fields as Field[],
      };

      // Add the duplicated section to state
      setSections((prev) => [...prev, newSection]);

      // Set it as active
      setActiveSectionId(newSection.id);

      setIsSaved(true);
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
    setIsSaved(false);
    try {
      await reorderSections(sectionOrders);

      setSections((prev) =>
        prev
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
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to reorder sections:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update section repeatability settings
   */
  async function updateRepeatability(
    sectionId: string,
    isRepeatable: boolean,
    repeatCount?: number
  ): Promise<void> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const updatedSection = await updateSectionRepeatability(
        sectionId,
        isRepeatable,
        repeatCount
      );

      // Update section in state with new repeatability settings
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                isRepeatable: updatedSection.isRepeatable,
                repeatCount: updatedSection.repeatCount,
              }
            : section
        )
      );

      setIsSaved(true);
    } catch (error) {
      console.error("Failed to update section repeatability:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Create a section from a template
   */
  async function addSectionFromTemplate(
    formId: string,
    templateId: string
  ): Promise<any> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const newSection = await createSectionFromTemplate(formId, templateId);

      setSections((prev) => [
        ...prev,
        { ...newSection, fields: newSection.fields || [] } as Section,
      ]);
      setActiveSectionId(newSection.id);
      setIsSaved(true);
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

  // ==================== FIELD OPERATIONS ====================

  /**
   * Add a new field to a section
   */
  async function addField(
    sectionId: string,
    fieldType: string,
    question?: string
  ): Promise<any> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const newField = await createField(sectionId, fieldType, question);

      // Update the section's fields in state
      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: [...section.fields, newField as Field],
              }
            : section
        )
      );

      setIsSaved(true);
      return newField;
    } catch (error) {
      console.error("Failed to add field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update field details (with debouncing for text fields)
   * Updates local state immediately, but debounces the API call
   * Uses optimistic locking to prevent race conditions
   */
  const updateFieldData = useCallback(
    (fieldId: string, data: Partial<Field>): Promise<any> => {
      // Increment version for this field update
      const currentVersion = (fieldUpdateVersions.current.get(fieldId) || 0) + 1;
      fieldUpdateVersions.current.set(fieldId, currentVersion);

      // Update local state immediately (optimistic update)
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          fields: section.fields.map((field) =>
            field.id === fieldId ? { ...field, ...data } : field
          ),
        }))
      );

      // Mark as unsaved
      setIsSaved(false);

      // Merge with any pending updates for this field
      const existingPending = pendingFieldUpdates.current.get(fieldId) || {};
      const mergedData = { ...existingPending, ...data };
      pendingFieldUpdates.current.set(fieldId, mergedData);

      // Clear existing timer for this field
      const existingTimer = fieldDebounceTimers.current.get(fieldId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Return a promise that resolves when the debounced save completes
      return new Promise((resolve, reject) => {
        // Capture the data snapshot at this moment (closure)
        const dataSnapshot = { ...mergedData };
        const versionSnapshot = currentVersion;

        const timer = setTimeout(async () => {
          // Check if this is still the latest version
          const latestVersion = fieldUpdateVersions.current.get(fieldId);
          if (latestVersion !== versionSnapshot) {
            // A newer update has been scheduled, skip this one
            resolve(null);
            return;
          }

          // Double-check that we still have pending data
          const dataToSave = pendingFieldUpdates.current.get(fieldId);
          if (!dataToSave) {
            resolve(null);
            return;
          }

          // Clear pending updates for this field
          pendingFieldUpdates.current.delete(fieldId);
          fieldDebounceTimers.current.delete(fieldId);

          setIsSaving(true);
          try {
            // Use the snapshot data, not the current ref value
            const updatedField = await updateField(fieldId, dataSnapshot);
            setIsSaved(true);
            resolve(updatedField);
          } catch (error) {
            console.error("Failed to update field:", error);
            
            // On error, restore the pending update so it can be retried
            pendingFieldUpdates.current.set(fieldId, dataSnapshot);
            
            reject(error);
          } finally {
            setIsSaving(false);
          }
        }, DEBOUNCE_DELAY);

        fieldDebounceTimers.current.set(fieldId, timer);
      });
    },
    []
  );

  /**
   * Force save all pending field updates immediately
   * Call this before operations that need up-to-date data (like duplicate, delete, etc.)
   */
  const flushPendingFieldUpdates = useCallback(async () => {
    const pendingUpdates = Array.from(pendingFieldUpdates.current.entries());

    if (pendingUpdates.length === 0) return;

    // Clear all timers
    fieldDebounceTimers.current.forEach((timer) => clearTimeout(timer));
    fieldDebounceTimers.current.clear();

    setIsSaving(true);
    try {
      await Promise.all(
        pendingUpdates.map(([fieldId, data]) => updateField(fieldId, data))
      );
      pendingFieldUpdates.current.clear();
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to flush pending updates:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Delete a field
   */
  async function removeFieldById(fieldId: string): Promise<void> {
    // Cancel any pending updates for this field
    const timer = fieldDebounceTimers.current.get(fieldId);
    if (timer) {
      clearTimeout(timer);
      fieldDebounceTimers.current.delete(fieldId);
    }
    pendingFieldUpdates.current.delete(fieldId);
    fieldUpdateVersions.current.delete(fieldId);

    setIsSaving(true);
    setIsSaved(false);
    try {
      await deleteField(fieldId);

      // Remove the field from state
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          fields: section.fields.filter((field) => field.id !== fieldId),
        }))
      );

      setIsSaved(true);
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
    // Flush any pending updates for this field before duplicating
    const pendingData = pendingFieldUpdates.current.get(fieldId);
    if (pendingData) {
      const timer = fieldDebounceTimers.current.get(fieldId);
      if (timer) clearTimeout(timer);
      fieldDebounceTimers.current.delete(fieldId);
      pendingFieldUpdates.current.delete(fieldId);
      await updateField(fieldId, pendingData);
    }

    setIsSaving(true);
    setIsSaved(false);
    try {
      const duplicatedField = await duplicateField(fieldId);

      // Add the duplicated field to the appropriate section
      setSections((prev) =>
        prev.map((section) => {
          // Find if this section contains the original field
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

      setIsSaved(true);
    } catch (error) {
      console.error("Failed to duplicate field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Reorder fields within a section
   */
  async function updateFieldsOrder(
    fieldOrders: Array<{ fieldId: string; order: number }>
  ): Promise<void> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      await reorderFields(fieldOrders);

      // Update field orders in state
      setSections((prev) =>
        prev.map((section) => ({
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

      setIsSaved(true);
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
    setIsSaved(false);
    try {
      const movedField = await moveFieldToSection(
        fieldId,
        targetSectionId,
        newOrder
      );

      // Update state by removing from old section and adding to new section
      setSections((prev) =>
        prev.map((section) => {
          // Remove from old section
          const fieldsWithoutMoved = section.fields.filter(
            (field) => field.id !== fieldId
          );

          // Add to target section
          if (section.id === targetSectionId) {
            return {
              ...section,
              fields: [...fieldsWithoutMoved, movedField as Field].sort(
                (a, b) => a.order - b.order
              ),
            };
          }

          // Just remove from other sections
          return {
            ...section,
            fields: fieldsWithoutMoved,
          };
        })
      );

      setIsSaved(true);
    } catch (error) {
      console.error("Failed to move field:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  // ==================== AI ENHANCE OPERATIONS ====================

  /**
   * Enhance a field using AI
   */
  async function enhanceFieldWithAI(
    field: any,
    sectionTitle?: string
  ): Promise<{
    success: boolean;
    data?: import("@/lib/agent").FieldEnhanceResponse;
    error?: string;
  }> {
    try {
      const { enhanceField } = await import("@/lib/agent");

      // Valid field types in UPPERCASE format (from Prisma)
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

      // Field type should already be UPPERCASE from Prisma, but normalize just in case
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
          options: field.options,
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

  /**
   * Regenerate enhancement with feedback
   */
  async function regenerateEnhancement(
    field: any,
    previousSuggestion: import("@/lib/agent").FieldEnhanceResponse,
    feedback?: string,
    sectionTitle?: string
  ): Promise<{
    success: boolean;
    data?: import("@/lib/agent").FieldEnhanceResponse;
    error?: string;
  }> {
    try {
      const { regenerateEnhancement: regenerate } = await import("@/lib/agent");

      // Valid field types in UPPERCASE format (from Prisma)
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

      // Field type should already be UPPERCASE from Prisma, but normalize just in case
      const normalizedType = field.type?.toUpperCase().replace(/-/g, "_");
      const fieldType = validFieldTypes.includes(normalizedType)
        ? normalizedType
        : "SHORT_ANSWER";

      const result = await regenerate(
        {
          fieldType,
          currentField: {
            question: field.question,
            description: field.description,
            placeholder: field.placeholder,
            options: field.options,
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
        previousSuggestion,
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

  // ==================== CONDITIONAL LOGIC OPERATIONS ====================

  /**
   * Update section's conditional navigation logic
   */
  async function updateSectionNavigationLogic(
    sectionId: string,
    logic: NextSectionLogic
  ): Promise<any> {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const updatedSection = await updateSectionLogic(sectionId, logic);

      setSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? { ...section, nextSectionLogic: logic }
            : section
        )
      );
      setIsSaved(true);
      return updatedSection;
    } catch (error) {
      console.error("Failed to update section logic:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Get section with all its fields (for conditional logic modal)
   */
  async function getSectionDetails(sectionId: string): Promise<any> {
    try {
      return await getSectionWithFields(sectionId);
    } catch (error) {
      console.error("Failed to get section details:", error);
      throw error;
    }
  }

  /**
   * Get fields that support conditional logic for a section
   */
  async function getConditionalFieldsForSection(
    sectionId: string
  ): Promise<Field[]> {
    try {
      return await getConditionalFields(sectionId);
    } catch (error) {
      console.error("Failed to get conditional fields:", error);
      return [];
    }
  }

  /**
   * Get all sections for navigation target selection
   */
  async function getSectionsForNavigation(
    formId: string
  ): Promise<Array<{ id: string; title: string; order: number }>> {
    try {
      return await getFormSectionsForNavigation(formId);
    } catch (error) {
      console.error("Failed to get sections for navigation:", error);
      return [];
    }
  }

  /**
   * Validate section logic before saving
   */
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

  /**
   * Check for circular references in form navigation
   */
  async function checkCircularReferences(formId: string): Promise<{
    hasCircularReference: boolean;
    cycles: string[][];
  }> {
    try {
      return await detectCircularReferences(formId);
    } catch (error) {
      console.error("Failed to check circular references:", error);
      return { hasCircularReference: false, cycles: [] };
    }
  }

  /**
   * Flush all pending updates (fields and sections)
   * Call this before navigation or when you need to ensure all data is saved
   */
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

    // Clear all timers
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
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to flush pending updates:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

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
    duplicateForm: duplicateFormHandler,
    deleteForm: deleteFormHandler,

    // Section operations
    sections,
    activeSectionId,
    setActiveSectionId,
    isLoadingSections,
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
