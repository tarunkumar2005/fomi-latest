"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  MessageSquare,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
}: FormCanvasProps) {
  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Advanced panel state - only one can be open at a time
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

  // Calculate stats from actual sections
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

  // Handle sidebar toggle - only one can be open at a time
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

  // Field handlers
  const handleFieldUpdate = async (fieldId: string, updates: any) => {
    if (!onUpdateField) return;
    try {
      await onUpdateField(fieldId, updates);
    } catch (error) {
      console.error("Failed to update field:", error);
    }
  };

  const handleFieldDelete = async (fieldId: string) => {
    if (!onDeleteField) return;
    try {
      await onDeleteField(fieldId);
    } catch (error) {
      console.error("Failed to delete field:", error);
    }
  };

  const handleFieldDuplicate = async (fieldId: string) => {
    if (!onDuplicateField) return;
    try {
      await onDuplicateField(fieldId);
    } catch (error) {
      console.error("Failed to duplicate field:", error);
    }
  };

  const handleAddQuestion = async (fieldType: string, sectionId?: string) => {
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
  };

  const handleEnhanceField = (fieldId: string) => {
    // TODO: Implement AI enhancement
  };

  const handleAdvancedToggle = (fieldId: string) => {
    setOpenAdvancedFieldId((prev) => (prev === fieldId ? null : fieldId));
  };

  // Section handlers
  const handleSectionTitleChange = async (sectionId: string, title: string) => {
    try {
      await onUpdateSection(sectionId, { title });
    } catch (error) {
      console.error("Failed to update section title:", error);
    }
  };

  const handleSectionDescriptionChange = async (
    sectionId: string,
    description: string
  ) => {
    try {
      await onUpdateSection(sectionId, { description });
    } catch (error) {
      console.error("Failed to update section description:", error);
    }
  };

  const handleSectionDuplicate = async (sectionId: string) => {
    try {
      await onDuplicateSection(sectionId);
    } catch (error) {
      console.error("Failed to duplicate section:", error);
      alert("Failed to duplicate section. Please try again.");
    }
  };

  const handleNavigationSettings = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) {
        console.error("Section not found:", sectionId);
        return;
      }

      // Load data for the dialog
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
      throw error; // Re-throw to let dialog handle it
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
      throw error; // Re-throw to let dialog handle it
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

  // Handle template selection (including blank template)
  const handleTemplateSelect = async (templateId: string) => {
    if (templateId === "blank") {
      // Create blank section
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
      // Create section from template
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
      // Check if any other sections reference this section in their logic
      const referencingSections = sections.filter((section) => {
        if (!section.nextSectionLogic || section.id === sectionId) return false;

        const logic = section.nextSectionLogic as NextSectionLogic;

        // Check default target
        if (logic.defaultTarget === sectionId) return true;

        // Check rules
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

        // Clean up references in other sections
        for (const refSection of referencingSections) {
          const logic = refSection.nextSectionLogic as NextSectionLogic;
          let needsUpdate = false;

          // Update default target if it references deleted section
          if (logic.defaultTarget === sectionId) {
            logic.defaultTarget = "NEXT";
            needsUpdate = true;
          }

          // Remove or update rules that reference deleted section
          if (logic.rules) {
            const updatedRules = logic.rules.filter((rule) => {
              if (rule.targetSectionId === sectionId) {
                // Reset to NEXT instead of removing the rule
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

      // Now delete the section
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
      // Create reordered sections array
      const reorderedSections = [...sections];
      const [movedSection] = reorderedSections.splice(oldIndex, 1);
      reorderedSections.splice(newIndex, 0, movedSection);

      // Create array with updated order values
      const sectionOrders = reorderedSections.map((section, index) => ({
        sectionId: section.id,
        order: index,
      }));

      // Call the reorder function
      onReorderSections(sectionOrders);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !onReorderFields) return;

    // Find which section contains the active field
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

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder fields within the same section
    const reorderedFields = [...sourceSection.fields];
    const [movedField] = reorderedFields.splice(oldIndex, 1);
    reorderedFields.splice(newIndex, 0, movedField);

    // Create array with updated order values
    const fieldOrders = reorderedFields.map((field, index) => ({
      fieldId: field.id,
      order: index,
    }));

    try {
      await onReorderFields(fieldOrders);
    } catch (error) {
      console.error("Failed to reorder fields:", error);
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="relative h-full flex">
        {/* Left Sidebar - Theme Customizer */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full bg-card border-r border-border z-20 transition-transform duration-200 ease-out",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "w-[400px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Theme options will go here
                  </p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Color picker</p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Typography settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Fomi Agent (AI Chat) */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full bg-card border-l border-border z-20 transition-transform duration-200 ease-out",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full",
            "w-[400px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Fomi Agent
                </h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    AI chat interface
                  </p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Message history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Toggle Button - Desktop */}
        <button
          onClick={handleLeftSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1.5",
            "w-12 h-20 bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-r-xl shadow-lg backdrop-blur-sm",
            "hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-xl hover:w-14",
            "transition-all duration-200 ease-out group",
            leftSidebarOpen ? "left-[400px]" : "left-0"
          )}
          title={leftSidebarOpen ? "Close Theme Customizer" : "Customize Theme"}
        >
          <Settings className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {leftSidebarOpen ? (
            <ChevronLeft className="h-3.5 w-3.5 text-primary/70" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
          )}
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {leftSidebarOpen ? "Close" : "Customize Theme"}
          </span>
        </button>

        {/* Right Toggle Button - Desktop */}
        <button
          onClick={handleRightSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1.5",
            "w-12 h-20 bg-linear-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-l-xl shadow-lg backdrop-blur-sm",
            "hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-xl hover:w-14",
            "transition-all duration-200 ease-out group",
            rightSidebarOpen ? "right-[400px]" : "right-0"
          )}
          title={rightSidebarOpen ? "Close Fomi Agent" : "Open Fomi Agent"}
        >
          <MessageSquare className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {rightSidebarOpen ? (
            <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-primary/70" />
          )}
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {rightSidebarOpen ? "Close" : "Ask Fomi Agent"}
          </span>
        </button>

        {/* Mobile Floating Buttons */}
        <button
          onClick={handleLeftSidebarToggle}
          className="md:hidden fixed bottom-6 left-6 z-30 w-14 h-14 bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Settings className="h-6 w-6" />
        </button>

        <button
          onClick={handleRightSidebarToggle}
          className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {/* Main Canvas Area */}
        <div
          className={cn(
            "flex-1 transition-all duration-200 ease-out overflow-y-auto bg-muted/20",
            leftSidebarOpen && "md:ml-[400px]",
            rightSidebarOpen && "md:mr-[400px]"
          )}
        >
          <div className="px-4 sm:px-6 pt-24 pb-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Form Header */}
              <FormHeader
                formTitle={formHeaderData?.title || "Untitled Form"}
                formDescription={formHeaderData?.description || ""}
                estimatedTime={timeEstimate.formatted}
                questionCount={questionCount}
                headerImageUrl={formHeaderData?.headerImageUrl || null}
                onSaveHeader={onHeaderSave}
              />

              {/* Sections Info - Temporary Debug Display */}
              {isLoadingSections ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading sections...
                  </p>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-6">
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
                        // Check if section has conditional logic
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
                            {/* Render fields belonging to this section */}
                            {section.fields && section.fields.length > 0 ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext
                                  items={section.fields.map(
                                    (field) => field.id
                                  )}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-4">
                                    {section.fields.map((field, fieldIdx) => {
                                      const commonProps = {
                                        field,
                                        index: fieldIdx + 1,
                                        onUpdate: (updates: any) =>
                                          handleFieldUpdate(field.id, updates),
                                        onDelete: () =>
                                          handleFieldDelete(field.id),
                                        onDuplicate: () =>
                                          handleFieldDuplicate(field.id),
                                        onEnhance: () =>
                                          handleEnhanceField(field.id),
                                        isAdvancedOpen:
                                          openAdvancedFieldId === field.id,
                                        onAdvancedToggle: () =>
                                          handleAdvancedToggle(field.id),
                                      };

                                      let fieldComponent;
                                      if (field.type === "paragraph") {
                                        fieldComponent = (
                                          <ParagraphField {...commonProps} />
                                        );
                                      } else if (field.type === "email") {
                                        fieldComponent = (
                                          <EmailField {...commonProps} />
                                        );
                                      } else if (field.type === "number") {
                                        fieldComponent = (
                                          <NumberField {...commonProps} />
                                        );
                                      } else if (field.type === "phone") {
                                        fieldComponent = (
                                          <PhoneField {...commonProps} />
                                        );
                                      } else if (
                                        field.type === "multiple-choice"
                                      ) {
                                        fieldComponent = (
                                          <MultipleChoiceField
                                            {...commonProps}
                                          />
                                        );
                                      } else if (field.type === "checkboxes") {
                                        fieldComponent = (
                                          <CheckboxesField {...commonProps} />
                                        );
                                      } else if (field.type === "dropdown") {
                                        fieldComponent = (
                                          <DropdownField {...commonProps} />
                                        );
                                      } else if (field.type === "rating") {
                                        fieldComponent = (
                                          <RatingField {...commonProps} />
                                        );
                                      } else if (
                                        field.type === "linear-scale"
                                      ) {
                                        fieldComponent = (
                                          <LinearScaleField {...commonProps} />
                                        );
                                      } else if (field.type === "url") {
                                        fieldComponent = (
                                          <UrlField {...commonProps} />
                                        );
                                      } else if (field.type === "date") {
                                        fieldComponent = (
                                          <DateField {...commonProps} />
                                        );
                                      } else if (field.type === "time") {
                                        fieldComponent = (
                                          <TimeField {...commonProps} />
                                        );
                                      } else if (field.type === "date-range") {
                                        fieldComponent = (
                                          <DateRangeField {...commonProps} />
                                        );
                                      } else if (field.type === "file-upload") {
                                        fieldComponent = (
                                          <FileUploadField {...commonProps} />
                                        );
                                      } else {
                                        fieldComponent = (
                                          <ShortAnswerField {...commonProps} />
                                        );
                                      }

                                      return (
                                        <DraggableFieldWrapper
                                          key={field.id}
                                          id={field.id}
                                        >
                                          {fieldComponent}
                                        </DraggableFieldWrapper>
                                      );
                                    })}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                <p className="text-sm mb-3">
                                  No fields in this section yet
                                </p>
                              </div>
                            )}

                            {/* Add Question Button at the end of section */}
                            {!collapsedSections.has(section.id) && (
                              <div className="mt-4">
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

                  {/* Add Section Button */}
                  <button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="w-full max-w-md mx-auto py-2.5 px-4 border border-dashed border-border/60 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground/70 hover:text-primary text-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="text-base">+</span>
                    <span>Add Section</span>
                  </button>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-muted-foreground mb-4">No sections yet</p>
                  <button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
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
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Mobile Sidebars - Full Screen */}
        {leftSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-card z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
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
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Fomi Agent
                </h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground">Mobile AI chat</p>
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
          currentLogic={
            selectedSectionForLogic.nextSectionLogic as NextSectionLogic | null
          }
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
          sectionId={selectedSectionForRepeat.id}
          sectionTitle={selectedSectionForRepeat.title}
          currentIsRepeatable={selectedSectionForRepeat.isRepeatable || false}
          currentRepeatCount={selectedSectionForRepeat.repeatCount || 1}
          hasConditionalLogic={
            selectedSectionForRepeat.nextSectionLogic &&
            (selectedSectionForRepeat.nextSectionLogic as any).type ===
              "conditional" &&
            (selectedSectionForRepeat.nextSectionLogic as NextSectionLogic)
              .rules?.length > 0
          }
          onSave={handleSaveRepeatability}
        />
      )}

      {/* Section Template Dialog */}
      <SectionTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}
