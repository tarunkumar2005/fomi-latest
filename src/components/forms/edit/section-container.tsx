"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2, Copy, MoreVertical, GripVertical, ChevronDown, ChevronUp, GitBranch, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SectionContainerProps {
  sectionId: string
  sectionNumber: number
  title: string
  description: string | null
  isActive: boolean
  isCollapsed?: boolean
  hasConditionalLogic?: boolean
  isRepeatable?: boolean
  repeatCount?: number | null
  children: React.ReactNode
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onDelete: () => void
  onDuplicate?: () => void
  onSettings?: () => void
  onNavigationSettings?: () => void
  onRepeatSettings?: () => void
  onToggleCollapse?: () => void
  onActivate: () => void
}

export default function SectionContainer({
  sectionId,
  sectionNumber,
  title,
  description,
  isActive,
  isCollapsed = false,
  hasConditionalLogic = false,
  isRepeatable = false,
  repeatCount = null,
  children,
  onTitleChange,
  onDescriptionChange,
  onDelete,
  onDuplicate,
  onSettings,
  onNavigationSettings,
  onRepeatSettings,
  onToggleCollapse,
  onActivate,
}: SectionContainerProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionId })

  useEffect(() => {
    setEditTitle(title)
  }, [title])

  useEffect(() => {
    setEditDescription(description || "")
  }, [description])

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus()
      descriptionRef.current.select()
    }
  }, [isEditingDescription])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (editTitle.trim() !== title) {
      onTitleChange(editTitle.trim() || "Untitled Section")
    }
  }

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false)
    if (editDescription !== description) {
      onDescriptionChange(editDescription)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false)
    onDelete()
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          backgroundColor: "var(--preview-card, hsl(var(--card)))",
          borderColor: isActive
            ? "var(--preview-primary, hsl(var(--primary)))"
            : "var(--preview-border, hsl(var(--border)))",
          borderRadius: "var(--preview-border-radius, 1rem)",
          borderWidth: "1px",
          borderStyle: "solid",
          ...(isActive && {
            borderLeftWidth: "4px",
            borderLeftColor: "var(--preview-primary, hsl(var(--primary)))",
            boxShadow: `0 0 0 1px color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 20%, transparent), 0 10px 15px -3px rgb(0 0 0 / 0.1)`,
          }),
        }}
        className={cn(
          "group relative transition-all duration-200",
          isActive ? "shadow-lg" : "hover:shadow-md",
          isDragging && "opacity-50 shadow-2xl z-50",
        )}
        onClick={() => !isActive && onActivate()}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...attributes}
                {...listeners}
                className={cn(
                  "absolute -left-10 top-6 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing",
                  isActive && "opacity-100",
                )}
              >
                <div className="p-2 rounded-lg hover:bg-muted border border-transparent hover:border-border/50 transition-all">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Drag to reorder
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Section Header */}
        <div
          className="p-5 sm:p-6 border-b space-y-3"
          style={{ borderColor: "var(--preview-border, hsl(var(--border)))" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Section Number Badge */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono bg-muted/80">
                  Section {sectionNumber}
                </Badge>
                {hasConditionalLogic && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
                      color: "var(--preview-primary, hsl(var(--primary)))",
                      borderColor: "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 20%, transparent)",
                    }}
                  >
                    <GitBranch className="h-3 w-3" />
                    Conditional
                  </Badge>
                )}
                {isRepeatable && repeatCount && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-warning/10 text-warning border-warning/20"
                  >
                    <Repeat className="h-3 w-3" />
                    Repeatable ({repeatCount}x)
                  </Badge>
                )}
              </div>

              {/* Section Title */}
              {isEditingTitle ? (
                <Input
                  ref={titleRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleBlur()
                    if (e.key === "Escape") {
                      setEditTitle(title)
                      setIsEditingTitle(false)
                    }
                  }}
                  style={{ borderColor: "var(--preview-primary, hsl(var(--primary)))", borderWidth: "2px" }}
                  className="text-lg font-semibold h-auto py-1.5 px-3 flex-1 rounded-lg"
                  placeholder="Section title"
                />
              ) : (
                <h3
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingTitle(true)
                  }}
                  style={{
                    color: title
                      ? "var(--preview-text, hsl(var(--foreground)))"
                      : "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                    fontFamily: "var(--preview-font-heading, var(--font-heading))",
                  }}
                  className={cn(
                    "text-lg font-semibold cursor-text transition-all hover:opacity-80 py-1",
                    !title && "italic",
                  )}
                >
                  {title || "Click to add section title"}
                </h3>
              )}

              {/* Section Description */}
              {isEditingDescription ? (
                <Textarea
                  ref={descriptionRef}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditDescription(description || "")
                      setIsEditingDescription(false)
                    }
                  }}
                  rows={2}
                  className="text-sm resize-none border-2 border-primary px-3 py-2 rounded-lg"
                  placeholder="Add description (optional)"
                />
              ) : (
                <p
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingDescription(true)
                  }}
                  style={{
                    color: description
                      ? "var(--preview-text-muted, hsl(var(--muted-foreground)))"
                      : "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 50%, transparent)",
                    fontFamily: "var(--preview-font-body, var(--font-body))",
                  }}
                  className={cn("text-sm cursor-text transition-all hover:opacity-80 py-1", !description && "italic")}
                >
                  {description || "Click to add description"}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {onToggleCollapse && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleCollapse()
                        }}
                        className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {isCollapsed ? "Expand section" : "Collapse section"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      "hover:bg-muted text-muted-foreground hover:text-foreground",
                      "opacity-0 group-hover:opacity-100",
                      isActive && "opacity-100",
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate} className="rounded-lg h-10">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Section
                    </DropdownMenuItem>
                  )}

                  {(onSettings || onNavigationSettings || onRepeatSettings) && (
                    <>
                      {onDuplicate && <DropdownMenuSeparator className="my-1" />}

                      {onSettings && !onNavigationSettings && !onRepeatSettings && (
                        <DropdownMenuItem onClick={onSettings} className="rounded-lg h-10">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Section Settings
                        </DropdownMenuItem>
                      )}

                      {onNavigationSettings && (
                        <DropdownMenuItem
                          onClick={onNavigationSettings}
                          disabled={isRepeatable}
                          className={cn("rounded-lg h-10", isRepeatable && "opacity-50")}
                        >
                          <GitBranch className="h-4 w-4 mr-2" />
                          Navigation Logic
                          {isRepeatable && <span className="ml-auto text-xs text-muted-foreground">(Disabled)</span>}
                        </DropdownMenuItem>
                      )}

                      {onRepeatSettings && (
                        <DropdownMenuItem
                          onClick={onRepeatSettings}
                          disabled={hasConditionalLogic}
                          className={cn("rounded-lg h-10", hasConditionalLogic && "opacity-50")}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Repeat Settings
                          {hasConditionalLogic && (
                            <span className="ml-auto text-xs text-muted-foreground">(Disabled)</span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {(onDuplicate || onSettings || onNavigationSettings || onRepeatSettings) && (
                    <DropdownMenuSeparator className="my-1" />
                  )}
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg h-10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Section Body */}
        {!isCollapsed && (
          <div className="p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{title}&quot; and all its fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}