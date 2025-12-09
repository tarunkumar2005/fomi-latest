"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SectionContainerProps {
  sectionId: string;
  sectionNumber: number;
  title: string;
  description: string | null;
  isActive: boolean;
  isCollapsed?: boolean;
  hasConditionalLogic?: boolean;
  isRepeatable?: boolean;
  repeatCount?: number | null;
  children: React.ReactNode;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onSettings?: () => void;
  onNavigationSettings?: () => void;
  onRepeatSettings?: () => void;
  onToggleCollapse?: () => void;
  onActivate: () => void;
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionId });

  // Sync with prop changes
  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    setEditDescription(description || "");
  }, [description]);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
      descriptionRef.current.select();
    }
  }, [isEditingDescription]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editTitle.trim() !== title) {
      onTitleChange(editTitle.trim() || "Untitled Section");
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (editDescription !== description) {
      onDescriptionChange(editDescription);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        className={cn(
          "group relative bg-card rounded-lg border transition-all duration-200",
          isActive
            ? "border-primary shadow-lg ring-1 ring-primary/20 border-l-4 border-l-primary"
            : "border-border hover:border-border/80 hover:shadow-sm",
          isDragging && "opacity-50 shadow-2xl z-50"
        )}
        onClick={() => !isActive && onActivate()}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-10 top-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
            isActive && "opacity-100"
          )}
        >
          <div className="p-2 rounded-md hover:bg-muted">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        {/* Section Header */}
        <div className="p-6 border-b border-border space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Section Title with Badge */}
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <Input
                    ref={titleRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTitleBlur();
                      }
                      if (e.key === "Escape") {
                        setEditTitle(title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="text-lg font-semibold h-auto py-1 px-2 border-2 border-primary flex-1"
                    placeholder="Section title"
                  />
                ) : (
                  <>
                    <h3
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                      }}
                      className={cn(
                        "text-lg font-semibold text-foreground cursor-text hover:text-primary transition-colors flex-1",
                        !title && "text-muted-foreground"
                      )}
                    >
                      {title || "Click to add section title"}
                    </h3>
                    {hasConditionalLogic && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                      >
                        <GitBranch className="h-3 w-3" />
                        <span className="text-xs">Conditional</span>
                      </Badge>
                    )}
                    {isRepeatable && repeatCount && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-warning/10 text-warning border-warning/20"
                      >
                        <Repeat className="h-3 w-3" />
                        <span className="text-xs">
                          Repeatable (Max: {repeatCount})
                        </span>
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
                      setEditDescription(description || "");
                      setIsEditingDescription(false);
                    }
                  }}
                  rows={2}
                  className="text-sm resize-none border-2 border-primary px-2 py-1"
                  placeholder="Add description (optional)"
                />
              ) : (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDescription(true);
                  }}
                  className={cn(
                    "text-sm cursor-text hover:text-foreground transition-colors",
                    description
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50 italic"
                  )}
                >
                  {description || "Click to add description"}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-1">
              {/* Collapse/Expand Button */}
              {onToggleCollapse && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  className="p-2 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                  title={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      "hover:bg-muted text-muted-foreground hover:text-foreground",
                      "opacity-0 group-hover:opacity-100",
                      isActive && "opacity-100"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Section
                    </DropdownMenuItem>
                  )}

                  {/* Settings submenu */}
                  {(onSettings || onNavigationSettings || onRepeatSettings) && (
                    <>
                      {onDuplicate && <DropdownMenuSeparator />}

                      {/* Legacy single settings option */}
                      {onSettings &&
                        !onNavigationSettings &&
                        !onRepeatSettings && (
                          <DropdownMenuItem onClick={onSettings}>
                            <Settings className="h-4 w-4 mr-2" />
                            Section Settings
                          </DropdownMenuItem>
                        )}

                      {/* Navigation settings */}
                      {onNavigationSettings && (
                        <DropdownMenuItem
                          onClick={onNavigationSettings}
                          disabled={isRepeatable}
                          className={isRepeatable ? "opacity-50" : ""}
                        >
                          <GitBranch className="h-4 w-4 mr-2" />
                          Navigation Logic
                          {isRepeatable && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              (Disabled)
                            </span>
                          )}
                        </DropdownMenuItem>
                      )}

                      {/* Repeat settings */}
                      {onRepeatSettings && (
                        <DropdownMenuItem
                          onClick={onRepeatSettings}
                          disabled={hasConditionalLogic}
                          className={hasConditionalLogic ? "opacity-50" : ""}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Repeat Settings
                          {hasConditionalLogic && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              (Disabled)
                            </span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {(onDuplicate ||
                    onSettings ||
                    onNavigationSettings ||
                    onRepeatSettings) && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Section Body - Fields will be rendered here (Hidden when collapsed) */}
        {!isCollapsed && <div className="p-6">{children}</div>}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{title}&quot; and all its
              fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
