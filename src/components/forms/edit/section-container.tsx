"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Trash2,
  Copy,
  Settings,
  MoreVertical,
  GripVertical,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Repeat,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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

  // Drag and drop functionality
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionId })

  // Sync with prop changes
  useEffect(() => {
    setEditTitle(title)
  }, [title])

  useEffect(() => {
    setEditDescription(description || "")
  }, [description])

  // Auto-focus when editing starts
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
        }}
        className={cn(
          "group relative bg-card rounded-xl sm:rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
          isActive
            ? "border-primary/50 shadow-lg ring-2 ring-primary/10 border-l-4 border-l-primary"
            : "border-border/40 hover:border-border/60",
          isDragging && "opacity-50 shadow-2xl z-50 scale-[1.02]",
        )}
        onClick={() => !isActive && onActivate()}
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-6 sm:-left-10 top-5 sm:top-6 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing",
            isActive && "opacity-100",
          )}
        >
          <div className="p-1.5 sm:p-2 rounded-lg hover:bg-muted bg-card border border-border/60 shadow-sm">
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-b border-border/40 space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              {/* Section Title with Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                  {sectionNumber}
                </span>

                {isEditingTitle ? (
                  <Input
                    ref={titleRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTitleBlur()
                      }
                      if (e.key === "Escape") {
                        setEditTitle(title)
                        setIsEditingTitle(false)
                      }
                    }}
                    className="text-base sm:text-lg font-semibold h-auto py-1 px-2 border-2 border-primary flex-1 rounded-lg"
                    placeholder="Section title"
                  />
                ) : (
                  <>
                    <h3
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditingTitle(true)
                      }}
                      className={cn(
                        "text-base sm:text-lg font-semibold text-foreground cursor-text hover:text-primary transition-colors flex-1 truncate",
                        !title && "text-muted-foreground",
                      )}
                    >
                      {title || "Click to add section title"}
                    </h3>
                    {hasConditionalLogic && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                      >
                        <GitBranch className="h-3 w-3" />
                        <span className="hidden sm:inline">Conditional</span>
                      </Badge>
                    )}
                    {isRepeatable && repeatCount && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2 py-0.5"
                      >
                        <Repeat className="h-3 w-3" />
                        <span className="hidden sm:inline">Repeat (Max: {repeatCount})</span>
                      </Badge>
                    )}
                  </>
                )}
              </div>

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
                  className="text-sm resize-none border-2 border-primary px-2 py-1 rounded-lg"
                  placeholder="Add description (optional)"
                />
              ) : (
                <p
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingDescription(true)
                  }}
                  className={cn(
                    "text-sm cursor-text hover:text-foreground transition-colors pl-8",
                    description ? "text-muted-foreground" : "text-muted-foreground/50 italic",
                  )}
                >
                  {description || "Click to add description"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Collapse/Expand Button */}
              {onToggleCollapse && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleCollapse()
                  }}
                  className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                  title={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg transition-colors",
                      "hover:bg-muted text-muted-foreground hover:text-foreground",
                      "opacity-0 group-hover:opacity-100",
                      isActive && "opacity-100",
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl border-border/60 shadow-xl">
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate} className="rounded-lg px-3 py-2.5 cursor-pointer">
                      <Copy className="h-4 w-4 mr-2.5" />
                      Duplicate Section
                    </DropdownMenuItem>
                  )}

                  {(onSettings || onNavigationSettings || onRepeatSettings) && (
                    <>
                      {onDuplicate && <DropdownMenuSeparator className="my-1.5" />}

                      {onSettings && !onNavigationSettings && !onRepeatSettings && (
                        <DropdownMenuItem onClick={onSettings} className="rounded-lg px-3 py-2.5 cursor-pointer">
                          <Settings className="h-4 w-4 mr-2.5" />
                          Section Settings
                        </DropdownMenuItem>
                      )}

                      {onNavigationSettings && (
                        <DropdownMenuItem
                          onClick={onNavigationSettings}
                          disabled={isRepeatable}
                          className={cn("rounded-lg px-3 py-2.5 cursor-pointer", isRepeatable && "opacity-50")}
                        >
                          <GitBranch className="h-4 w-4 mr-2.5" />
                          Navigation Logic
                          {isRepeatable && <span className="ml-auto text-xs text-muted-foreground">(Disabled)</span>}
                        </DropdownMenuItem>
                      )}

                      {onRepeatSettings && (
                        <DropdownMenuItem
                          onClick={onRepeatSettings}
                          disabled={hasConditionalLogic}
                          className={cn("rounded-lg px-3 py-2.5 cursor-pointer", hasConditionalLogic && "opacity-50")}
                        >
                          <Repeat className="h-4 w-4 mr-2.5" />
                          Repeat Settings
                          {hasConditionalLogic && (
                            <span className="ml-auto text-xs text-muted-foreground">(Disabled)</span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {(onDuplicate || onSettings || onNavigationSettings || onRepeatSettings) && (
                    <DropdownMenuSeparator className="my-1.5" />
                  )}
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive rounded-lg px-3 py-2.5 cursor-pointer hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2.5" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {!isCollapsed && <div className="p-4 sm:p-6">{children}</div>}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-border/60 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">Delete Section?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete &quot;{title}&quot; and all its fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
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