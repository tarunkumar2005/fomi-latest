"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Palette,
  Plus,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import FormHeader from "./form-header";
import AddQuestionButton from "./add-question-button";
import SectionContainer from "./section-container";
import DraggableFieldWrapper from "./shared/DraggableFieldWrapper";
import ShortAnswerField from "../form-fields/short-answer-field";
import ParagraphField from "../form-fields/paragraph-field";
import EmailField from "../form-fields/email-field";
import NumberField from "../form-fields/number-field";
import PhoneField from "../form-fields/phone-field";
import MultipleChoiceField from "../form-fields/multiple-choice-field";
import CheckboxesField from "../form-fields/checkboxes-field";
import DropdownField from "../form-fields/dropdown-field";
import RatingField from "../form-fields/rating-field";
import LinearScaleField from "../form-fields/linear-scale-field";
import UrlField from "../form-fields/url-field";
import DateField from "../form-fields/date-field";
import TimeField from "../form-fields/time-field";
import DateRangeField from "../form-fields/date-range-field";
import FileUploadField from "../form-fields/file-upload-field";

import { calculateFormEstimatedTime } from "@/lib/field-time-estimation";
import type { NextSectionLogic } from "@/types/conditional-logic";
import SectionLogicDialog from "./section-logic-dialog";
import SectionRepeatDialog from "./section-repeat-dialog";
import SectionTemplateDialog from "./section-templates/section-template-dialog";
import AIEnhanceDialog from "./ai-enhance-dialog";
import type { FieldEnhanceResponse } from "@/lib/agent";
import { toast } from "sonner";
import { memo } from "react";

// Memoized field renderer to prevent re-renders on every keystroke
const FieldRenderer = memo(
  ({
    field,
    index,
    openAdvancedFieldId,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    onAdvancedToggle,
  }: {
    field: any;
    index: number;
    openAdvancedFieldId: string | null;
    onUpdate: (fieldId: string, updates: any) => void;
    onDelete: (fieldId: string) => void;
    onDuplicate: (fieldId: string) => void;
    onEnhance: (fieldId: string) => void;
    onAdvancedToggle: (fieldId: string) => void;
  }) => {
    const commonProps = {
      field,
      index,
      onUpdate: (updates: any) => onUpdate(field.id, updates),
      onDelete: () => onDelete(field.id),
      onDuplicate: () => onDuplicate(field.id),
      onEnhance: () => onEnhance(field.id),
      isAdvancedOpen: openAdvancedFieldId === field.id,
      onAdvancedToggle: () => onAdvancedToggle(field.id),
    };

    let fieldComponent;
    if (field.type === "paragraph") {
      fieldComponent = <ParagraphField {...commonProps} />;
    } else if (field.type === "email") {
      fieldComponent = <EmailField {...commonProps} />;
    } else if (field.type === "number") {
      fieldComponent = <NumberField {...commonProps} />;
    } else if (field.type === "phone") {
      fieldComponent = <PhoneField {...commonProps} />;
    } else if (field.type === "multiple-choice") {
      fieldComponent = <MultipleChoiceField {...commonProps} />;
    } else if (field.type === "checkboxes") {
      fieldComponent = <CheckboxesField {...commonProps} />;
    } else if (field.type === "dropdown") {
      fieldComponent = <DropdownField {...commonProps} />;
    } else if (field.type === "rating") {
      fieldComponent = <RatingField {...commonProps} />;
    } else if (field.type === "linear-scale") {
      fieldComponent = <LinearScaleField {...commonProps} />;
    } else if (field.type === "url") {
      fieldComponent = <UrlField {...commonProps} />;
    } else if (field.type === "date") {
      fieldComponent = <DateField {...commonProps} />;
    } else if (field.type === "time") {
      fieldComponent = <TimeField {...commonProps} />;
    } else if (field.type === "date-range") {
      fieldComponent = <DateRangeField {...commonProps} />;
    } else if (field.type === "file-upload") {
      fieldComponent = <FileUploadField {...commonProps} />;
    } else {
      fieldComponent = <ShortAnswerField {...commonProps} />;
    }

    return (
      <DraggableFieldWrapper key={field.id} id={field.id}>
        {fieldComponent}
      </DraggableFieldWrapper>
    );
  },
  (prev, next) => {
    // Only re-render if these props change
    return (
      prev.field === next.field &&
      prev.index === next.index &&
      prev.openAdvancedFieldId === next.openAdvancedFieldId
    );
  }
);

FieldRenderer.displayName = "FieldRenderer";

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  nextSectionLogic: any;
  isRepeatable?: boolean;
  repeatCount?: number | null;
  fields: any[];
}

interface Field {
  id: string;
  type: string;
  question: string;
  order: number;
}

interface FormCanvasProps {
  formSlug: string;
  formHeaderData: any;
  onHeaderSave?: (title: string, description: string) => void;
  // Section props
  sections: Section[];
  isLoadingSections: boolean;
  activeSectionId: string | null;
  onActiveSectionChange: (sectionId: string) => void;
  onAddSection: (
    formId: string,
    title?: string,
    description?: string
  ) => Promise<any>;
  onAddSectionFromTemplate?: (
    formId: string,
    templateId: string
  ) => Promise<any>;
  onUpdateSection: (
    sectionId: string,
    data: { title?: string; description?: string; nextSectionLogic?: any }
  ) => Promise<any>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onDuplicateSection: (sectionId: string) => Promise<void>;
  onReorderSections: (
    sectionOrders: Array<{ sectionId: string; order: number }>
  ) => Promise<void>;
  // Field props
  onAddField?: (
    sectionId: string,
    fieldType: string,
    question?: string
  ) => Promise<any>;
  onUpdateField?: (fieldId: string, data: Partial<Field>) => Promise<any>;
  onDeleteField?: (fieldId: string) => Promise<void>;
  onDuplicateField?: (fieldId: string) => Promise<void>;
  onReorderFields?: (
    fieldOrders: Array<{ fieldId: string; order: number }>
  ) => Promise<void>;
  onMoveField?: (
    fieldId: string,
    targetSectionId: string,
    newOrder?: number
  ) => Promise<void>;
  // AI Enhance props
  onEnhanceField?: (
    field: any,
    sectionTitle?: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  onRegenerateEnhancement?: (
    field: any,
    previousSuggestion: any,
    feedback?: string,
    sectionTitle?: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  // Conditional logic props
  onUpdateSectionLogic: (
    sectionId: string,
    logic: NextSectionLogic
  ) => Promise<any>;
  onGetSectionDetails: (sectionId: string) => Promise<any>;
  onGetConditionalFields: (sectionId: string) => Promise<Field[]>;
  onGetSectionsForNavigation: (
    formId: string
  ) => Promise<Array<{ id: string; title: string; order: number }>>;
  onValidateLogic: (
    formId: string,
    sectionId: string,
    logic: NextSectionLogic
  ) => Promise<{ valid: boolean; errors: string[] }>;
  onCheckCircularReferences: (formId: string) => Promise<{
    hasCircularReference: boolean;
    cycles: string[][];
  }>;
  // Repeatability props
  onUpdateRepeatability?: (
    sectionId: string,
    isRepeatable: boolean,
    repeatCount?: number
  ) => Promise<any>;
}

export default function FormCanvas({
  formSlug,
  formHeaderData,
  onHeaderSave,
  // Section props
  sections,
  isLoadingSections,
  activeSectionId,
  onActiveSectionChange,
  onAddSection,
  onAddSectionFromTemplate,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onReorderSections,
  // Field props
  onAddField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onReorderFields,
  onMoveField,
  // Conditional logic props
  onUpdateSectionLogic,
  onGetSectionDetails,
  onGetConditionalFields,
  onGetSectionsForNavigation,
  onValidateLogic,
  onCheckCircularReferences,
  // Repeatability props
  onUpdateRepeatability,
  // AI Enhance props
  onEnhanceField,
  onRegenerateEnhancement,
}: FormCanvasProps) {
  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Advanced panel state
  const [openAdvancedFieldId, setOpenAdvancedFieldId] = useState<string | null>(
    null
  );

  // Section collapsed states
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  // Section Logic Dialog state
  const [logicDialogOpen, setLogicDialogOpen] = useState(false);
  const [selectedSectionForLogic, setSelectedSectionForLogic] =
    useState<Section | null>(null);
  const [logicDialogData, setLogicDialogData] = useState<{
    fields: any[];
    sections: Array<{ id: string; title: string; order: number }>;
  }>({ fields: [], sections: [] });

  // Section Repeat Dialog state
  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false);
  const [selectedSectionForRepeat, setSelectedSectionForRepeat] =
    useState<Section | null>(null);

  // Section Template Dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // AI Enhance Dialog state
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false);
  const [enhanceField, setEnhanceField] = useState<any>(null);
  const [enhanceSectionTitle, setEnhanceSectionTitle] = useState<
    string | undefined
  >(undefined);
  const [enhancement, setEnhancement] = useState<FieldEnhanceResponse | null>(
    null
  );
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Calculate stats
  const allFields = sections.flatMap((section) => section.fields || []);
  const questionCount = allFields.length;
  const timeEstimate = calculateFormEstimatedTime(allFields);

  // Close sidebars on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle sidebar toggle
  const handleLeftSidebarToggle = () => {
    if (!leftSidebarOpen && rightSidebarOpen) {
      setRightSidebarOpen(false);
    }
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const handleRightSidebarToggle = () => {
    if (!rightSidebarOpen && leftSidebarOpen) {
      setLeftSidebarOpen(false);
    }
    setRightSidebarOpen(!rightSidebarOpen);
  };

  // Memoized field handlers to prevent re-creation on every render
  const handleFieldUpdate = useCallback(
    async (fieldId: string, updates: any) => {
      if (!onUpdateField) return;
      try {
        await onUpdateField(fieldId, updates);
      } catch (error) {
        console.error("Failed to update field:", error);
      }
    },
    [onUpdateField]
  );

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!onDeleteField) return;
      try {
        await onDeleteField(fieldId);
      } catch (error) {
        console.error("Failed to delete field:", error);
      }
    },
    [onDeleteField]
  );

  const handleFieldDuplicate = useCallback(
    async (fieldId: string) => {
      if (!onDuplicateField) return;
      try {
        await onDuplicateField(fieldId);
      } catch (error) {
        console.error("Failed to duplicate field:", error);
      }
    },
    [onDuplicateField]
  );

  const handleAddQuestion = useCallback(
    async (fieldType: string, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId;
      if (!onAddField || !targetSectionId) {
        console.warn("Cannot add field: No active section or handler missing");
        return;
      }
      try {
        await onAddField(targetSectionId, fieldType);
      } catch (error) {
        console.error("Failed to add field:", error);
      }
    },
    [activeSectionId, onAddField]
  );

  const handleEnhanceField = useCallback(
    async (fieldId: string) => {
      if (!onEnhanceField) return;

      // Find the field and its section
      let targetField: any = null;
      let targetSectionTitle: string | undefined = undefined;

      for (const section of sections) {
        const field = section.fields.find((f) => f.id === fieldId);
        if (field) {
          targetField = field;
          targetSectionTitle = section.title;
          break;
        }
      }

      if (!targetField) {
        console.error("Field not found:", fieldId);
        return;
      }

      // Block enhancement if field question is empty
      if (!targetField.question || targetField.question.trim() === "") {
        toast.error("Cannot enhance empty field", {
          description: "Please add a question first before using AI Enhance.",
        });
        return;
      }

      // Open dialog and start enhancement
      setEnhanceField(targetField);
      setEnhanceSectionTitle(targetSectionTitle);
      setEnhanceDialogOpen(true);
      setIsEnhancing(true);
      setEnhancement(null);

      try {
        const result = await onEnhanceField(targetField, targetSectionTitle);
        if (result.success && result.data) {
          setEnhancement(result.data);
        }
      } catch (error) {
        console.error("Enhancement failed:", error);
      } finally {
        setIsEnhancing(false);
      }
    },
    [sections, onEnhanceField]
  );

  const handleApplyEnhancement = async () => {
    if (!enhancement || !enhanceField || !onUpdateField) return;

    try {
      const updates: any = {
        question: enhancement.question,
      };

      if (enhancement.description !== undefined) {
        updates.description = enhancement.description;
      }

      if (enhancement.placeholder !== undefined) {
        updates.placeholder = enhancement.placeholder;
      }

      if (enhancement.options !== undefined && enhancement.options !== null) {
        updates.options = enhancement.options;
      }

      if (enhancement.minLabel !== undefined) {
        updates.minLabel = enhancement.minLabel;
      }

      if (enhancement.maxLabel !== undefined) {
        updates.maxLabel = enhancement.maxLabel;
      }

      await onUpdateField(enhanceField.id, updates);
      setEnhanceDialogOpen(false);
      setEnhanceField(null);
      setEnhancement(null);
    } catch (error) {
      console.error("Failed to apply enhancement:", error);
    }
  };

  const handleRegenerateEnhancement = async (feedback?: string) => {
    if (!onRegenerateEnhancement || !enhanceField || !enhancement) return;

    setIsEnhancing(true);

    try {
      const result = await onRegenerateEnhancement(
        enhanceField,
        enhancement,
        feedback,
        enhanceSectionTitle
      );
      if (result.success && result.data) {
        setEnhancement(result.data);
      } else if (!result.success) {
        // Show error toast when regeneration fails (e.g., validation error)
        toast.error("Regeneration failed", {
          description:
            result.error || "Please try again with different feedback.",
        });
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
      toast.error("Regeneration failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAdvancedToggle = useCallback((fieldId: string) => {
    setOpenAdvancedFieldId((prev) => (prev === fieldId ? null : fieldId));
  }, []);

  // Memoized section handlers to prevent re-creation on every render
  const handleSectionTitleChange = useCallback(
    async (sectionId: string, title: string) => {
      try {
        await onUpdateSection(sectionId, { title });
      } catch (error) {
        console.error("Failed to update section title:", error);
      }
    },
    [onUpdateSection]
  );

  const handleSectionDescriptionChange = useCallback(
    async (sectionId: string, description: string) => {
      try {
        await onUpdateSection(sectionId, { description });
      } catch (error) {
        console.error("Failed to update section description:", error);
      }
    },
    [onUpdateSection]
  );

  const handleSectionDuplicate = useCallback(
    async (sectionId: string) => {
      try {
        await onDuplicateSection(sectionId);
      } catch (error) {
        console.error("Failed to duplicate section:", error);
        alert("Failed to duplicate section. Please try again.");
      }
    },
    [onDuplicateSection]
  );

  const handleNavigationSettings = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) {
        console.error("Section not found:", sectionId);
        return;
      }

      const [fields, availableSections] = await Promise.all([
        onGetConditionalFields(sectionId),
        onGetSectionsForNavigation(formHeaderData?.id),
      ]);

      setSelectedSectionForLogic(section);
      setLogicDialogData({ fields, sections: availableSections });
      setLogicDialogOpen(true);
    } catch (error) {
      console.error("Failed to open navigation settings:", error);
    }
  };

  const handleRepeatSettings = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      console.error("Section not found:", sectionId);
      return;
    }

    setSelectedSectionForRepeat(section);
    setRepeatDialogOpen(true);
  };

  // Section Logic Handlers
  const handleSaveLogic = async (logic: NextSectionLogic) => {
    if (!selectedSectionForLogic) return;

    try {
      await onUpdateSectionLogic(selectedSectionForLogic.id, logic);
    } catch (error) {
      console.error("Failed to save section logic:", error);
      throw error;
    }
  };

  const handleValidateLogic = async (logic: NextSectionLogic) => {
    if (!selectedSectionForLogic || !formHeaderData?.id) {
      return { valid: false, errors: ["Invalid section or form data"] };
    }

    try {
      const validation = await onValidateLogic(
        formHeaderData.id,
        selectedSectionForLogic.id,
        logic
      );
      return validation;
    } catch (error) {
      console.error("Failed to validate logic:", error);
      return { valid: false, errors: ["Validation failed"] };
    }
  };

  // Section Repeat Handlers
  const handleSaveRepeatability = async (
    isRepeatable: boolean,
    repeatCount?: number
  ) => {
    if (!selectedSectionForRepeat || !onUpdateRepeatability) return;

    try {
      await onUpdateRepeatability(
        selectedSectionForRepeat.id,
        isRepeatable,
        repeatCount
      );
    } catch (error) {
      console.error("Failed to save repeatability:", error);
      throw error;
    }
  };

  const handleCheckCircularReferences = async () => {
    if (!formHeaderData?.id) {
      return { hasCircularReference: false, cycles: [] };
    }

    try {
      const result = await onCheckCircularReferences(formHeaderData.id);
      return result;
    } catch (error) {
      console.error("Failed to check circular references:", error);
      return { hasCircularReference: false, cycles: [] };
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    if (templateId === "blank") {
      if (!formHeaderData?.id) return;
      try {
        await onAddSection(
          formHeaderData.id,
          `Section ${sections.length + 1}`,
          ""
        );
        setTemplateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create blank section:", error);
      }
    } else {
      if (!formHeaderData?.id || !onAddSectionFromTemplate) return;
      try {
        await onAddSectionFromTemplate(formHeaderData.id, templateId);
        setTemplateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create section from template:", error);
      }
    }
  };

  // Handle section deletion with logic cleanup
  const handleSectionDelete = async (sectionId: string) => {
    try {
      const referencingSections = sections.filter((section) => {
        if (!section.nextSectionLogic || section.id === sectionId) return false;

        const logic = section.nextSectionLogic as NextSectionLogic;

        if (logic.defaultTarget === sectionId) return true;

        return logic.rules?.some((rule) => rule.targetSectionId === sectionId);
      });

      if (referencingSections.length > 0) {
        const sectionNames = referencingSections.map((s) => s.title).join(", ");
        const confirmDelete = window.confirm(
          `Warning: This section is referenced in the navigation logic of the following sections: ${sectionNames}.\n\n` +
            `If you delete this section, those navigation rules will become invalid and will be reset to "Next Section".\n\n` +
            `Do you want to continue?`
        );

        if (!confirmDelete) return;

        for (const refSection of referencingSections) {
          const logic = refSection.nextSectionLogic as NextSectionLogic;
          let needsUpdate = false;

          if (logic.defaultTarget === sectionId) {
            logic.defaultTarget = "NEXT";
            needsUpdate = true;
          }

          if (logic.rules) {
            const updatedRules = logic.rules.filter((rule) => {
              if (rule.targetSectionId === sectionId) {
                rule.targetSectionId = "NEXT";
                needsUpdate = true;
              }
              return true;
            });

            logic.rules = updatedRules;
          }

          if (needsUpdate) {
            await onUpdateSectionLogic(refSection.id, logic);
          }
        }
      }

      await onDeleteSection(sectionId);
    } catch (error) {
      console.error("Failed to delete section:", error);
      alert("Failed to delete section. Please try again.");
    }
  };

  const handleToggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSections = [...sections];
      const [movedSection] = reorderedSections.splice(oldIndex, 1);
      reorderedSections.splice(newIndex, 0, movedSection);

      const sectionOrders = reorderedSections.map((section, index) => ({
        sectionId: section.id,
        order: index,
      }));

      onReorderSections(sectionOrders);
    }
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !onReorderFields) return;

      const sourceSection = sections.find((section) =>
        section.fields.some((field) => field.id === active.id)
      );

      if (!sourceSection) return;

      const oldIndex = sourceSection.fields.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = sourceSection.fields.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Only create field orders array, avoid creating intermediate arrays
      const fieldOrders = sourceSection.fields.map((field, index) => {
        if (index === oldIndex) {
          return { fieldId: field.id, order: newIndex };
        } else if (oldIndex < newIndex && index > oldIndex && index <= newIndex) {
          return { fieldId: field.id, order: index - 1 };
        } else if (oldIndex > newIndex && index >= newIndex && index < oldIndex) {
          return { fieldId: field.id, order: index + 1 };
        }
        return { fieldId: field.id, order: index };
      });

      try {
        await onReorderFields(fieldOrders);
      } catch (error) {
        console.error("Failed to reorder fields:", error);
      }
    },
    [sections, onReorderFields]
  );

  return (
    <div className="h-full overflow-hidden">
      <div className="relative h-full flex">
        <div
          className={cn(
            "absolute left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 z-20 transition-transform duration-300 ease-out shadow-2xl",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "w-[320px] lg:w-[380px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-base lg:text-lg font-semibold">
                    Theme Customizer
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Customize your form's look
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="space-y-4">
                <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Theme options will go here
                  </p>
                </div>
                <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Color picker</p>
                </div>
                <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Typography settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute right-0 top-0 h-full bg-card/95 backdrop-blur-xl border-l border-border/50 z-20 transition-transform duration-300 ease-out shadow-2xl",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full",
            "w-[320px] lg:w-[380px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-base lg:text-lg font-semibold">
                    Fomi Agent
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    AI-powered assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="space-y-4">
                <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    AI chat interface
                  </p>
                </div>
                <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Message history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLeftSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1",
            "w-10 lg:w-12 h-16 lg:h-20 bg-card/90 backdrop-blur-sm border border-border/60 rounded-r-xl shadow-lg",
            "hover:bg-card hover:border-primary/30 hover:shadow-xl hover:w-12 lg:hover:w-14",
            "transition-all duration-200 ease-out group",
            leftSidebarOpen ? "left-80 lg:left-[380px]" : "left-0"
          )}
          title={leftSidebarOpen ? "Close Theme Customizer" : "Customize Theme"}
        >
          <Palette className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {leftSidebarOpen ? (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={handleRightSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1",
            "w-10 lg:w-12 h-16 lg:h-20 bg-card/90 backdrop-blur-sm border border-border/60 rounded-l-xl shadow-lg",
            "hover:bg-card hover:border-primary/30 hover:shadow-xl hover:w-12 lg:hover:w-14",
            "transition-all duration-200 ease-out group",
            rightSidebarOpen ? "right-80 lg:right-[380px]" : "right-0"
          )}
          title={rightSidebarOpen ? "Close Fomi Agent" : "Open Fomi Agent"}
        >
          <Sparkles className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {rightSidebarOpen ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={handleLeftSidebarToggle}
          className="md:hidden fixed bottom-20 left-4 z-30 w-12 h-12 bg-card border border-border/60 text-primary rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Palette className="h-5 w-5" />
        </button>

        <button
          onClick={handleRightSidebarToggle}
          className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-out overflow-y-auto",
            "bg-linear-to-b from-muted/30 via-background to-muted/20",
            leftSidebarOpen && "md:ml-80 lg:md:ml-[380px]",
            rightSidebarOpen && "md:mr-80 lg:md:mr-[380px]"
          )}
        >
          <div className="px-3 sm:px-4 lg:px-6 pt-20 sm:pt-24 pb-24 sm:pb-8">
            <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Form Header */}
              <FormHeader
                formTitle={formHeaderData?.title || "Untitled Form"}
                formDescription={formHeaderData?.description || ""}
                estimatedTime={timeEstimate.formatted}
                questionCount={questionCount}
                headerImageUrl={formHeaderData?.headerImageUrl || null}
                onSaveHeader={onHeaderSave}
              />

              {/* Sections */}
              {isLoadingSections ? (
                <div className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 text-center shadow-sm">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading sections...
                  </p>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSectionDragEnd}
                  >
                    <SortableContext
                      items={sections.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                       {sections.map((section, idx) => {
                        const hasConditionalLogic =
                          section.nextSectionLogic &&
                          (section.nextSectionLogic as NextSectionLogic)
                            .type === "conditional" &&
                          (section.nextSectionLogic as NextSectionLogic).rules
                            ?.length > 0;

                        return (
                          <SectionContainer
                            key={section.id}
                            sectionId={section.id}
                            sectionNumber={idx + 1}
                            title={section.title}
                            description={section.description}
                            isActive={activeSectionId === section.id}
                            isCollapsed={collapsedSections.has(section.id)}
                            hasConditionalLogic={hasConditionalLogic}
                            isRepeatable={section.isRepeatable}
                            repeatCount={section.repeatCount}
                            onTitleChange={(title: string) =>
                              handleSectionTitleChange(section.id, title)
                            }
                            onDescriptionChange={(description: string) =>
                              handleSectionDescriptionChange(
                                section.id,
                                description
                              )
                            }
                            onToggleCollapse={() =>
                              handleToggleSectionCollapse(section.id)
                            }
                            onDelete={() => handleSectionDelete(section.id)}
                            onDuplicate={() =>
                              handleSectionDuplicate(section.id)
                            }
                            onNavigationSettings={() =>
                              handleNavigationSettings(section.id)
                            }
                            onRepeatSettings={() =>
                              handleRepeatSettings(section.id)
                            }
                            onActivate={() => onActiveSectionChange(section.id)}
                          >
                            {/* Render fields */}
                            {section.fields && section.fields.length > 0 ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext
                                  items={section.fields.map((f) => f.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-3 sm:space-y-4">
                                    {section.fields.map((field, fieldIdx) => (
                                      <FieldRenderer
                                        key={field.id}
                                        field={field}
                                        index={fieldIdx + 1}
                                        openAdvancedFieldId={openAdvancedFieldId}
                                        onUpdate={handleFieldUpdate}
                                        onDelete={handleFieldDelete}
                                        onDuplicate={handleFieldDuplicate}
                                        onEnhance={handleEnhanceField}
                                        onAdvancedToggle={handleAdvancedToggle}
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            ) : (
                              <div className="text-center py-6 sm:py-8 text-muted-foreground border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
                                <p className="text-sm mb-3">
                                  No fields in this section yet
                                </p>
                              </div>
                            )}

                            {/* Add Question Button */}
                            {!collapsedSections.has(section.id) && (
                              <div className="mt-3 sm:mt-4">
                                <AddQuestionButton
                                  onAddQuestion={handleAddQuestion}
                                  sectionId={section.id}
                                />
                              </div>
                            )}
                          </SectionContainer>
                        );
                      })}
                    </SortableContext>
                  </DndContext>

                  <button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="w-full max-w-sm mx-auto py-3 px-4 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-2 group"
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Section</span>
                  </button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border/60 p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    No sections yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start building your form by adding your first section
                  </p>
                  <button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    Add Your First Section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Mobile Sidebars - Full Screen */}
        {leftSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-card z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="h-4.5 w-4.5 text-primary" />
                </div>
                <h2 className="font-heading text-lg font-semibold">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground">Mobile theme options</p>
            </div>
          </div>
        )}

        {rightSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-card z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                </div>
                <h2 className="font-heading text-lg font-semibold">
                  Fomi Agent
                </h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground">Mobile AI chat interface</p>
            </div>
          </div>
        )}
      </div>

      {/* Section Logic Dialog */}
      {selectedSectionForLogic && (
        <SectionLogicDialog
          open={logicDialogOpen}
          onOpenChange={setLogicDialogOpen}
          sectionId={selectedSectionForLogic.id}
          sectionTitle={selectedSectionForLogic.title}
          currentLogic={selectedSectionForLogic.nextSectionLogic}
          fields={logicDialogData.fields}
          availableSections={logicDialogData.sections}
          onSave={handleSaveLogic}
          onValidate={handleValidateLogic}
        />
      )}

      {/* Section Repeat Dialog */}
      {selectedSectionForRepeat && (
        <SectionRepeatDialog
          open={repeatDialogOpen}
          onOpenChange={setRepeatDialogOpen}
          sectionTitle={selectedSectionForRepeat.title}
          isRepeatable={selectedSectionForRepeat.isRepeatable || false}
          repeatCount={selectedSectionForRepeat.repeatCount || null}
          onSave={handleSaveRepeatability}
        />
      )}

      {/* Section Template Dialog */}
      <SectionTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* AI Enhance Dialog */}
      <AIEnhanceDialog
        open={enhanceDialogOpen}
        onOpenChange={(open) => {
          setEnhanceDialogOpen(open);
          if (!open) {
            setEnhanceField(null);
            setEnhancement(null);
          }
        }}
        field={enhanceField}
        enhancement={enhancement}
        isLoading={isEnhancing}
        onApply={handleApplyEnhancement}
        onRegenerate={handleRegenerateEnhancement}
      />
    </div>
  );
}
