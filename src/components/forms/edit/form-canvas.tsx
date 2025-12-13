"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Canvas sub-components
import {
  FieldRenderer,
  SidebarToggle,
  CanvasSidebar,
  EmptyCanvasState,
  LoadingState,
  MobileOverlay,
  AddSectionButton,
} from "./canvas"

// Form components
import FormHeader from "./form-header"
import AddQuestionButton from "./add-question-button"
import SectionContainer from "./section-container"
import SectionLogicDialog from "./section-logic-dialog"
import SectionRepeatDialog from "./section-repeat-dialog"
import SectionTemplateDialog from "./section-templates/section-template-dialog"
import AIEnhanceDialog from "./ai-enhance-dialog"
import ThemeSidebar from "./theme-customize/theme-sidebar"

import { calculateFormEstimatedTime } from "@/lib/field-time-estimation"
import type { NextSectionLogic } from "@/types/conditional-logic"
import type { FieldType } from "@/app/generated/prisma/enums"
import type {
  Section,
  Field,
  FormHeaderData,
  SectionUpdateData,
  FieldUpdateData,
  AIEnhancementResult,
  AIEnhancementSuggestion,
  CircularReferenceResult,
} from "@/types/form-edit"

interface FormCanvasProps {
  formId: string
  formSlug: string
  userId?: string
  workspaceId?: string
  formHeaderData: FormHeaderData | null
  onHeaderSave?: (title: string, description: string, headerImageUrl?: string) => void
  isSaving?: boolean
  sections: Section[]
  isLoadingSections: boolean
  activeSectionId: string | null
  onActiveSectionChange: (sectionId: string) => void
  onAddSection: (formId: string, title?: string, description?: string) => Promise<Section>
  onAddSectionFromTemplate?: (formId: string, templateId: string) => Promise<Section>
  onUpdateSection: (sectionId: string, data: SectionUpdateData) => Promise<Section>
  onDeleteSection: (sectionId: string) => Promise<void>
  onDuplicateSection: (sectionId: string) => Promise<void>
  onReorderSections: (sectionOrders: Array<{ sectionId: string; order: number }>) => Promise<void>
  onAddField?: (sectionId: string, fieldType: FieldType, question?: string) => Promise<Field>
  onUpdateField?: (fieldId: string, data: FieldUpdateData) => Promise<Field>
  onDeleteField?: (fieldId: string) => Promise<void>
  onDuplicateField?: (fieldId: string) => Promise<void>
  onReorderFields?: (fieldOrders: Array<{ fieldId: string; order: number }>) => Promise<void>
  onMoveField?: (fieldId: string, targetSectionId: string, newOrder?: number) => Promise<void>
  onEnhanceField?: (field: Field, sectionTitle?: string) => Promise<AIEnhancementResult>
  onRegenerateEnhancement?: (
    field: Field,
    previousSuggestion: AIEnhancementResult["data"],
    feedback?: string,
    sectionTitle?: string,
  ) => Promise<AIEnhancementResult>
  onUpdateSectionLogic: (sectionId: string, logic: NextSectionLogic) => Promise<any>
  onGetSectionDetails: (sectionId: string) => Promise<any>
  onGetConditionalFields: (
    sectionId: string,
  ) => Promise<Array<{ id: string; question: string; type: FieldType; options: any }>>
  onGetSectionsForNavigation: (formId: string) => Promise<Array<{ id: string; title: string; order: number }>>
  onValidateLogic: (
    formId: string,
    sectionId: string,
    logic: NextSectionLogic,
  ) => Promise<{ valid: boolean; errors: string[] }>
  onCheckCircularReferences: (formId: string) => Promise<CircularReferenceResult>
  onUpdateRepeatability?: (sectionId: string, isRepeatable: boolean, repeatCount?: number) => Promise<any>
}

export default function FormCanvas({
  formId,
  formSlug,
  userId,
  workspaceId,
  formHeaderData,
  onHeaderSave,
  isSaving = false,
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
  onAddField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onReorderFields,
  onMoveField,
  onUpdateSectionLogic,
  onGetSectionDetails,
  onGetConditionalFields,
  onGetSectionsForNavigation,
  onValidateLogic,
  onCheckCircularReferences,
  onUpdateRepeatability,
  onEnhanceField,
  onRegenerateEnhancement,
}: FormCanvasProps) {
  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<any>(null)

  // Memoize parsed theme data for preview container
  const themeStyles = useMemo(() => {
    if (!currentTheme) return null

    const colors = typeof currentTheme.colors === "string" ? JSON.parse(currentTheme.colors) : currentTheme.colors

    const typography =
      typeof currentTheme.typography === "string" ? JSON.parse(currentTheme.typography) : currentTheme.typography

    const layout = typeof currentTheme.layout === "string" ? JSON.parse(currentTheme.layout) : currentTheme.layout

    const fontSizes: Record<string, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }

    const spacings: Record<string, string> = {
      compact: "0.75rem",
      normal: "1rem",
      relaxed: "1.5rem",
    }

    const shadows: Record<string, string> = {
      none: "none",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    }

    return {
      primary: colors?.primary || "#6366f1",
      background: colors?.background || "#ffffff",
      card: colors?.card || "#ffffff",
      text: colors?.text || "#0f172a",
      textMuted: colors?.textMuted || "#64748b",
      border: colors?.border || "#e2e8f0",
      accent: colors?.accent || "#eef2ff",
      fontHeading: typography?.headingFont || "Sora",
      fontBody: typography?.bodyFont || "Inter",
      fontSize: fontSizes[typography?.fontSize as string] || "16px",
      borderRadius: `${layout?.borderRadius || 12}px`,
      spacing: spacings[layout?.spacing as string] || "1rem",
      shadow: shadows[layout?.shadow as string] || shadows.md,
    }
  }, [currentTheme])

  // Apply theme CSS variables
  useEffect(() => {
    if (!currentTheme) return

    const root = document.documentElement

    if (currentTheme.colors) {
      const colors = typeof currentTheme.colors === "string" ? JSON.parse(currentTheme.colors) : currentTheme.colors

      root.style.setProperty("--theme-primary", colors.primary || "#6366f1")
      root.style.setProperty("--theme-background", colors.background || "#ffffff")
      root.style.setProperty("--theme-card", colors.card || "#ffffff")
      root.style.setProperty("--theme-text", colors.text || "#0f172a")
      root.style.setProperty("--theme-text-muted", colors.textMuted || "#64748b")
      root.style.setProperty("--theme-border", colors.border || "#e2e8f0")
      root.style.setProperty("--theme-accent", colors.accent || "#eef2ff")
    }

    if (currentTheme.typography) {
      const typography =
        typeof currentTheme.typography === "string" ? JSON.parse(currentTheme.typography) : currentTheme.typography

      root.style.setProperty("--theme-font-heading", typography.headingFont || "Sora")
      root.style.setProperty("--theme-font-body", typography.bodyFont || "Inter")
    }

    if (currentTheme.layout) {
      const layout = typeof currentTheme.layout === "string" ? JSON.parse(currentTheme.layout) : currentTheme.layout

      root.style.setProperty("--theme-radius", `${layout.borderRadius || 12}px`)
    }

    return () => {
      ;[
        "--theme-primary",
        "--theme-background",
        "--theme-card",
        "--theme-text",
        "--theme-text-muted",
        "--theme-border",
        "--theme-accent",
        "--theme-font-heading",
        "--theme-font-body",
        "--theme-radius",
      ].forEach((prop) => root.style.removeProperty(prop))
    }
  }, [currentTheme])

  // Advanced panel state
  const [openAdvancedFieldId, setOpenAdvancedFieldId] = useState<string | null>(null)

  // Section collapsed states
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Dialog states
  const [logicDialogOpen, setLogicDialogOpen] = useState(false)
  const [selectedSectionForLogic, setSelectedSectionForLogic] = useState<Section | null>(null)
  const [logicDialogData, setLogicDialogData] = useState<{
    fields: any[]
    sections: Array<{ id: string; title: string; order: number }>
  }>({ fields: [], sections: [] })

  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false)
  const [selectedSectionForRepeat, setSelectedSectionForRepeat] = useState<Section | null>(null)

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  // AI Enhance state
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false)
  const [enhanceField, setEnhanceField] = useState<any>(null)
  const [enhanceSectionTitle, setEnhanceSectionTitle] = useState<string | undefined>(undefined)
  const [enhancement, setEnhancement] = useState<AIEnhancementSuggestion | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  // Calculate stats
  const { questionCount, timeEstimate } = useMemo(() => {
    const allFields = sections.flatMap((section) => section.fields || [])
    return {
      questionCount: allFields.length,
      timeEstimate: calculateFormEstimatedTime(allFields),
    }
  }, [sections])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Sidebar handlers
  const handleLeftSidebarToggle = () => {
    if (!leftSidebarOpen && rightSidebarOpen) setRightSidebarOpen(false)
    setLeftSidebarOpen(!leftSidebarOpen)
  }

  const handleRightSidebarToggle = () => {
    if (!rightSidebarOpen && leftSidebarOpen) setLeftSidebarOpen(false)
    setRightSidebarOpen(!rightSidebarOpen)
  }

  const closeSidebars = () => {
    setLeftSidebarOpen(false)
    setRightSidebarOpen(false)
  }

  // Field handlers
  const handleFieldUpdate = useCallback(
    async (fieldId: string, updates: any) => {
      if (!onUpdateField) return
      try {
        await onUpdateField(fieldId, updates)
      } catch (error) {
        console.error("Failed to update field:", error)
      }
    },
    [onUpdateField],
  )

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!onDeleteField) return
      try {
        await onDeleteField(fieldId)
      } catch (error) {
        console.error("Failed to delete field:", error)
      }
    },
    [onDeleteField],
  )

  const handleFieldDuplicate = useCallback(
    async (fieldId: string) => {
      if (!onDuplicateField) return
      try {
        await onDuplicateField(fieldId)
      } catch (error) {
        console.error("Failed to duplicate field:", error)
      }
    },
    [onDuplicateField],
  )

  const handleAddQuestion = useCallback(
    async (fieldType: FieldType, sectionId?: string) => {
      const targetSectionId = sectionId || activeSectionId
      if (!onAddField || !targetSectionId) return
      try {
        await onAddField(targetSectionId, fieldType)
      } catch (error) {
        console.error("Failed to add field:", error)
      }
    },
    [activeSectionId, onAddField],
  )

  const handleEnhanceField = useCallback(
    async (fieldId: string) => {
      if (!onEnhanceField) return

      let targetField: any = null
      let targetSectionTitle: string | undefined = undefined

      for (const section of sections) {
        const field = section.fields.find((f) => f.id === fieldId)
        if (field) {
          targetField = field
          targetSectionTitle = section.title
          break
        }
      }

      if (!targetField) return

      if (!targetField.question || targetField.question.trim() === "") {
        toast.error("Cannot enhance empty field", {
          description: "Please add a question first before using AI Enhance.",
        })
        return
      }

      setEnhanceField(targetField)
      setEnhanceSectionTitle(targetSectionTitle)
      setEnhanceDialogOpen(true)
      setIsEnhancing(true)
      setEnhancement(null)

      try {
        const result = await onEnhanceField(targetField, targetSectionTitle)
        if (result.success && result.data) {
          setEnhancement(result.data)
          setEnhanceError(null)
        } else {
          setEnhanceError(result.error || "Enhancement failed. Please try again.")
        }
      } catch (error) {
        setEnhanceError(error instanceof Error ? error.message : "Enhancement failed. Please try again.")
      } finally {
        setIsEnhancing(false)
      }
    },
    [sections, onEnhanceField],
  )

  const handleApplyEnhancement = () => {
    if (!enhancement || !enhanceField || !onUpdateField) {
      toast.error("Cannot apply changes")
      return
    }

    const updates: any = {}

    if (enhancement.question !== undefined && enhancement.question !== null) {
      updates.question = enhancement.question
    }
    if (enhancement.description !== undefined) {
      updates.description = enhancement.description
    }
    if (enhancement.placeholder !== undefined) {
      updates.placeholder = enhancement.placeholder
    }
    if (enhancement.options !== undefined && enhancement.options !== null) {
      updates.options = enhancement.options
    }
    if (enhancement.minLabel !== undefined) {
      updates.minLabel = enhancement.minLabel
    }
    if (enhancement.maxLabel !== undefined) {
      updates.maxLabel = enhancement.maxLabel
    }

    if (Object.keys(updates).length === 0) {
      toast.error("No changes to apply")
      return
    }

    onUpdateField(enhanceField.id, updates)
    toast.success("Enhancement applied")
    setEnhanceDialogOpen(false)
    setEnhanceField(null)
    setEnhancement(null)
    setEnhanceError(null)
  }

  const handleRetryEnhancement = async () => {
    if (!enhanceField || !onEnhanceField) return

    setIsEnhancing(true)
    setEnhanceError(null)

    try {
      const result = await onEnhanceField(enhanceField, enhanceSectionTitle)
      if (result.success && result.data) {
        setEnhancement(result.data)
      } else {
        setEnhanceError(result.error || "Enhancement failed.")
      }
    } catch (error) {
      setEnhanceError(error instanceof Error ? error.message : "Enhancement failed.")
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleRegenerateEnhancement = async (feedback?: string) => {
    if (!onRegenerateEnhancement || !enhanceField || !enhancement) return

    setIsEnhancing(true)
    setEnhanceError(null)

    try {
      const result = await onRegenerateEnhancement(enhanceField, enhancement, feedback, enhanceSectionTitle)
      if (result.success && result.data) {
        setEnhancement(result.data)
      } else {
        setEnhanceError(result.error || "Please try again.")
        toast.error("Regeneration failed")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong."
      setEnhanceError(errorMsg)
      toast.error("Regeneration failed")
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleAdvancedToggle = useCallback((fieldId: string) => {
    setOpenAdvancedFieldId((prev) => (prev === fieldId ? null : fieldId))
  }, [])

  // Section handlers
  const handleSectionTitleChange = useCallback(
    async (sectionId: string, title: string) => {
      try {
        await onUpdateSection(sectionId, { title })
      } catch (error) {
        console.error("Failed to update section title:", error)
      }
    },
    [onUpdateSection],
  )

  const handleSectionDescriptionChange = useCallback(
    async (sectionId: string, description: string) => {
      try {
        await onUpdateSection(sectionId, { description })
      } catch (error) {
        console.error("Failed to update section description:", error)
      }
    },
    [onUpdateSection],
  )

  const handleSectionDuplicate = useCallback(
    async (sectionId: string) => {
      try {
        await onDuplicateSection(sectionId)
      } catch (error) {
        console.error("Failed to duplicate section:", error)
      }
    },
    [onDuplicateSection],
  )

  const handleNavigationSettings = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId)
      if (!section) return

      const [fields, availableSections] = await Promise.all([
        onGetConditionalFields(sectionId),
        onGetSectionsForNavigation(formHeaderData?.id ?? ""),
      ])

      setSelectedSectionForLogic(section)
      setLogicDialogData({ fields, sections: availableSections })
      setLogicDialogOpen(true)
    } catch (error) {
      console.error("Failed to open navigation settings:", error)
    }
  }

  const handleRepeatSettings = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    setSelectedSectionForRepeat(section)
    setRepeatDialogOpen(true)
  }

  const handleSaveLogic = async (logic: NextSectionLogic) => {
    if (!selectedSectionForLogic) return
    try {
      await onUpdateSectionLogic(selectedSectionForLogic.id, logic)
    } catch (error) {
      console.error("Failed to save section logic:", error)
      throw error
    }
  }

  const handleValidateLogic = async (logic: NextSectionLogic) => {
    if (!selectedSectionForLogic || !formHeaderData?.id) {
      return { valid: false, errors: ["Invalid section or form data"] }
    }

    try {
      return await onValidateLogic(formHeaderData.id, selectedSectionForLogic.id, logic)
    } catch (error) {
      return { valid: false, errors: ["Validation failed"] }
    }
  }

  const handleSaveRepeatability = async (isRepeatable: boolean, repeatCount?: number) => {
    if (!selectedSectionForRepeat || !onUpdateRepeatability) return
    try {
      await onUpdateRepeatability(selectedSectionForRepeat.id, isRepeatable, repeatCount)
    } catch (error) {
      console.error("Failed to save repeatability:", error)
      throw error
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    if (templateId === "blank") {
      if (!formHeaderData?.id) return
      try {
        await onAddSection(formHeaderData.id, `Section ${sections.length + 1}`, "")
        setTemplateDialogOpen(false)
      } catch (error) {
        console.error("Failed to create blank section:", error)
      }
    } else {
      if (!formHeaderData?.id || !onAddSectionFromTemplate) return
      try {
        await onAddSectionFromTemplate(formHeaderData.id, templateId)
        setTemplateDialogOpen(false)
      } catch (error) {
        console.error("Failed to create section from template:", error)
      }
    }
  }

  const handleSectionDelete = async (sectionId: string) => {
    try {
      const referencingSections = sections.filter((section) => {
        if (!section.nextSectionLogic || section.id === sectionId) return false
        const logic = section.nextSectionLogic as unknown as NextSectionLogic
        if (logic.defaultTarget === sectionId) return true
        return logic.rules?.some((rule) => rule.targetSectionId === sectionId)
      })

      if (referencingSections.length > 0) {
        const sectionNames = referencingSections.map((s) => s.title).join(", ")
        const confirmDelete = window.confirm(
          `Warning: This section is referenced in navigation logic of: ${sectionNames}.\n\nContinue?`,
        )

        if (!confirmDelete) return

        for (const refSection of referencingSections) {
          const logic = refSection.nextSectionLogic as unknown as NextSectionLogic
          let needsUpdate = false

          if (logic.defaultTarget === sectionId) {
            logic.defaultTarget = "NEXT"
            needsUpdate = true
          }

          if (logic.rules) {
            logic.rules = logic.rules.map((rule) => {
              if (rule.targetSectionId === sectionId) {
                needsUpdate = true
                return { ...rule, targetSectionId: "NEXT" }
              }
              return rule
            })
          }

          if (needsUpdate) {
            await onUpdateSectionLogic(refSection.id, logic)
          }
        }
      }

      await onDeleteSection(sectionId)
    } catch (error) {
      console.error("Failed to delete section:", error)
    }
  }

  const handleToggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Drag handlers
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSections = [...sections]
      const [movedSection] = reorderedSections.splice(oldIndex, 1)
      reorderedSections.splice(newIndex, 0, movedSection)

      const sectionOrders = reorderedSections.map((section, index) => ({
        sectionId: section.id,
        order: index,
      }))

      onReorderSections(sectionOrders)
    }
  }

  const handleFieldDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !onReorderFields) return

      const sourceSection = sections.find((section) => section.fields.some((field) => field.id === active.id))

      if (!sourceSection) return

      const oldIndex = sourceSection.fields.findIndex((field) => field.id === active.id)
      const newIndex = sourceSection.fields.findIndex((field) => field.id === over.id)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const fieldOrders = sourceSection.fields.map((field, index) => {
        if (index === oldIndex) {
          return { fieldId: field.id, order: newIndex }
        } else if (oldIndex < newIndex && index > oldIndex && index <= newIndex) {
          return { fieldId: field.id, order: index - 1 }
        } else if (oldIndex > newIndex && index >= newIndex && index < oldIndex) {
          return { fieldId: field.id, order: index + 1 }
        }
        return { fieldId: field.id, order: index }
      })

      try {
        await onReorderFields(fieldOrders)
      } catch (error) {
        console.error("Failed to reorder fields:", error)
      }
    },
    [sections, onReorderFields],
  )

  return (
    <div className="h-full overflow-hidden">
      <div className="relative h-full flex">
        {/* Left Sidebar - Theme Customizer */}
        <CanvasSidebar
          side="left"
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          title="Theme Customizer"
          subtitle="Personalize your form"
          icon="palette"
        >
          <ThemeSidebar formId={formId} userId={userId} workspaceId={workspaceId} onThemeChange={setCurrentTheme} />
        </CanvasSidebar>

        {/* Right Sidebar - AI Assistant */}
        <CanvasSidebar
          side="right"
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          title="Fomi Agent"
          subtitle="AI-powered assistant"
          icon="sparkles"
        >
          <div className="p-4 lg:p-6 space-y-4">
            <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
              <p className="text-sm text-muted-foreground">AI chat interface</p>
            </div>
            <div className="h-28 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Message history</p>
            </div>
          </div>
        </CanvasSidebar>

        {/* Sidebar Toggle Buttons */}
        <SidebarToggle
          side="left"
          isOpen={leftSidebarOpen}
          onToggle={handleLeftSidebarToggle}
          icon="palette"
          label="Theme Customizer"
        />
        <SidebarToggle
          side="right"
          isOpen={rightSidebarOpen}
          onToggle={handleRightSidebarToggle}
          icon="sparkles"
          label="Fomi Agent"
        />

        {/* Main Canvas Area */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-out overflow-y-auto",
            leftSidebarOpen && "md:ml-80 lg:md:ml-[380px]",
            rightSidebarOpen && "md:mr-80 lg:md:mr-[380px]",
          )}
          style={
            themeStyles
              ? ({
                  "--preview-primary": themeStyles.primary,
                  "--preview-background": themeStyles.background,
                  "--preview-card": themeStyles.card,
                  "--preview-text": themeStyles.text,
                  "--preview-text-muted": themeStyles.textMuted,
                  "--preview-border": themeStyles.border,
                  "--preview-accent": themeStyles.accent,
                  backgroundColor: themeStyles.background,
                  fontFamily: themeStyles.fontBody,
                  fontSize: themeStyles.fontSize,
                } as React.CSSProperties)
              : {}
          }
        >
          <div className="px-3 sm:px-4 lg:px-6 pt-20 sm:pt-24 pb-24 sm:pb-8">
            <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6" style={{ gap: themeStyles?.spacing || "1.5rem" }}>
              {/* Form Header */}
              <FormHeader
                formTitle={formHeaderData?.title || "Untitled Form"}
                formDescription={formHeaderData?.description || ""}
                estimatedTime={timeEstimate.formatted}
                questionCount={questionCount}
                headerImageUrl={formHeaderData?.headerImageUrl || null}
                onSaveHeader={onHeaderSave}
                isSaving={isSaving}
              />

              {/* Sections */}
              {isLoadingSections ? (
                <LoadingState message="Loading sections..." />
              ) : sections.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                    <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      {sections.map((section, idx) => {
                        const hasConditionalLogic =
                          section.nextSectionLogic &&
                          (section.nextSectionLogic as unknown as NextSectionLogic).type === "conditional" &&
                          (section.nextSectionLogic as unknown as NextSectionLogic).rules?.length > 0

                        return (
                          <SectionContainer
                            key={section.id}
                            sectionId={section.id}
                            sectionNumber={idx + 1}
                            title={section.title}
                            description={section.description}
                            isActive={activeSectionId === section.id}
                            isCollapsed={collapsedSections.has(section.id)}
                            hasConditionalLogic={Boolean(hasConditionalLogic)}
                            isRepeatable={section.isRepeatable}
                            repeatCount={section.repeatCount}
                            onTitleChange={(title: string) => handleSectionTitleChange(section.id, title)}
                            onDescriptionChange={(description: string) =>
                              handleSectionDescriptionChange(section.id, description)
                            }
                            onToggleCollapse={() => handleToggleSectionCollapse(section.id)}
                            onDelete={() => handleSectionDelete(section.id)}
                            onDuplicate={() => handleSectionDuplicate(section.id)}
                            onNavigationSettings={() => handleNavigationSettings(section.id)}
                            onRepeatSettings={() => handleRepeatSettings(section.id)}
                            onActivate={() => onActiveSectionChange(section.id)}
                          >
                            {section.fields && section.fields.length > 0 ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleFieldDragEnd}
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
                                <p className="text-sm mb-3">No fields in this section yet</p>
                              </div>
                            )}

                            {!collapsedSections.has(section.id) && (
                              <div className="mt-3 sm:mt-4">
                                <AddQuestionButton onAddQuestion={handleAddQuestion} sectionId={section.id} />
                              </div>
                            )}
                          </SectionContainer>
                        )
                      })}
                    </SortableContext>
                  </DndContext>

                  <AddSectionButton onClick={() => setTemplateDialogOpen(true)} />
                </div>
              ) : (
                <EmptyCanvasState
                  onAddBlankSection={async () => {
                    if (formHeaderData?.id) {
                      await onAddSection(formHeaderData.id)
                    }
                  }}
                  onOpenTemplates={() => setTemplateDialogOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        <MobileOverlay isVisible={leftSidebarOpen || rightSidebarOpen} onClose={closeSidebars} />
      </div>

      {/* Dialogs */}
      {selectedSectionForLogic && (
        <SectionLogicDialog
          open={logicDialogOpen}
          onOpenChange={setLogicDialogOpen}
          sectionId={selectedSectionForLogic.id}
          sectionTitle={selectedSectionForLogic.title}
          currentLogic={selectedSectionForLogic.nextSectionLogic as unknown as NextSectionLogic | null}
          fields={logicDialogData.fields}
          availableSections={logicDialogData.sections}
          onSave={handleSaveLogic}
          onValidate={handleValidateLogic}
        />
      )}

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

      <SectionTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />

      <AIEnhanceDialog
        open={enhanceDialogOpen}
        onOpenChange={(open) => {
          setEnhanceDialogOpen(open)
          if (!open) {
            setEnhanceField(null)
            setEnhancement(null)
            setEnhanceError(null)
          }
        }}
        field={enhanceField}
        enhancement={enhancement}
        isLoading={isEnhancing}
        error={enhanceError}
        onApply={handleApplyEnhancement}
        onRegenerate={handleRegenerateEnhancement}
        onRetry={handleRetryEnhancement}
      />
    </div>
  )
}