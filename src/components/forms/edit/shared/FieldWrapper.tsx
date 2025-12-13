"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
  type KeyboardEvent,
} from "react";
import {
  type LucideIcon,
  Trash2,
  Copy,
  Settings,
  GripVertical,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AIEnhanceIcon from "@/assets/icon/ai-enhance.png";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DragHandleContextValue {
  listeners?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
}

export const DragHandleContext = createContext<DragHandleContextValue>({});

export function useDragHandle() {
  return useContext(DragHandleContext);
}

interface FieldWrapperProps {
  children: ReactNode;
  index: number;
  fieldType: string;
  fieldIcon: LucideIcon;
  fieldId: string;
  question: string;
  description?: string;
  required: boolean;
  isEditingQuestion: boolean;
  isEditingDescription: boolean;
  isHovered: boolean;
  onQuestionClick: () => void;
  onDescriptionClick: () => void;
  onQuestionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onQuestionBlur: () => void;
  onDescriptionBlur: () => void;
  onQuestionKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onDescriptionKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onRequiredToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  onAdvancedClick?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  questionRef: RefObject<HTMLInputElement | null>;
  descriptionRef: RefObject<HTMLTextAreaElement | null>;
  showAdvanced?: boolean;
}

export default function FieldWrapper({
  children,
  index,
  fieldType,
  fieldIcon: FieldIcon,
  fieldId,
  question,
  description,
  required,
  isEditingQuestion,
  isEditingDescription,
  isHovered,
  onQuestionClick,
  onDescriptionClick,
  onQuestionChange,
  onDescriptionChange,
  onQuestionBlur,
  onDescriptionBlur,
  onQuestionKeyDown,
  onDescriptionKeyDown,
  onRequiredToggle,
  onDelete,
  onDuplicate,
  onEnhance,
  onAdvancedClick,
  onMouseEnter,
  onMouseLeave,
  questionRef,
  descriptionRef,
  showAdvanced = true,
}: FieldWrapperProps) {
  const { listeners, attributes } = useDragHandle();

  return (
    <div
      className={cn(
        "group relative border overflow-hidden",
        "transition-all duration-300 ease-out"
      )}
      style={{
        backgroundColor: "var(--preview-card, hsl(var(--card)))",
        borderColor: isHovered
          ? "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 40%, transparent)"
          : "color-mix(in srgb, var(--preview-border, hsl(var(--border))) 50%, transparent)",
        boxShadow: isHovered
          ? `0 10px 15px -3px color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent), var(--preview-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))`
          : "var(--preview-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
        borderRadius: "var(--preview-radius, 12px)",
        transform: isHovered ? "scale(1.002)" : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          "opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
        style={{
          backgroundImage: isHovered
            ? `linear-gradient(to right, color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 60%, transparent), var(--preview-primary, hsl(var(--primary))), color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 60%, transparent))`
            : undefined,
        }}
      />

      {/* Drag Handle & Field Type Badge */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          "bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40"
        )}
        style={{
          borderColor:
            "color-mix(in srgb, var(--preview-border, hsl(var(--border))) 30%, transparent)",
        }}
      >
        <div className="flex items-center gap-3">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "cursor-grab active:cursor-grabbing p-1.5 rounded-lg -ml-1",
                    "opacity-40 hover:opacity-100",
                    "hover:bg-primary/10 hover:text-primary",
                    "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    "transition-all duration-200",
                    "touch-none select-none"
                  )}
                  {...listeners}
                  {...attributes}
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs font-medium">
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge
            variant="secondary"
            className={cn(
              "gap-1.5 px-3 py-1.5 font-medium text-xs border",
              "transition-colors duration-200"
            )}
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
              color: "var(--preview-primary, hsl(var(--primary)))",
              borderColor:
                "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 20%, transparent)",
            }}
          >
            <FieldIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{fieldType}</span>
          </Badge>

          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full",
              "text-xs font-semibold",
              "transition-colors duration-200"
            )}
            style={{
              backgroundColor: isHovered
                ? "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)"
                : "color-mix(in srgb, var(--preview-text, hsl(var(--muted-foreground))) 10%, transparent)",
              color: isHovered
                ? "var(--preview-primary, hsl(var(--primary)))"
                : "color-mix(in srgb, var(--preview-text, hsl(var(--muted-foreground))) 70%, transparent)",
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            "flex items-center gap-0.5 transition-all duration-300",
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          )}
        >
          <TooltipProvider delayDuration={200}>
            {onEnhance && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEnhance}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      "text-muted-foreground hover:text-primary",
                      "hover:bg-primary/10 active:scale-95",
                      "transition-all duration-200"
                    )}
                  >
                    <Image
                      src={AIEnhanceIcon}
                      alt="AI"
                      className="h-4 w-4"
                      width={16}
                      height={16}
                    />
                    <span className="sr-only">Enhance with AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  Enhance with AI
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDuplicate}
                  className={cn(
                    "h-8 w-8 rounded-lg",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent active:scale-95",
                    "transition-all duration-200"
                  )}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Duplicate field</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Duplicate
              </TooltipContent>
            </Tooltip>

            {showAdvanced && onAdvancedClick && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAdvancedClick}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-accent active:scale-95",
                      "transition-all duration-200"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Advanced settings</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  Settings
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className={cn(
                    "h-8 w-8 rounded-lg",
                    "text-muted-foreground hover:text-destructive",
                    "hover:bg-destructive/10 active:scale-95",
                    "transition-all duration-200"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete field</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Delete
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Field Content */}
      <div className="p-5 space-y-4">
        {/* Question */}
        <div className="space-y-1">
          {isEditingQuestion ? (
            <Input
              ref={questionRef}
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              onBlur={onQuestionBlur}
              onKeyDown={onQuestionKeyDown}
              placeholder="Enter your question..."
              className={cn(
                "font-semibold h-auto py-2.5 px-3",
                "border-2",
                "focus-visible:ring-2",
                "transition-all duration-200"
              )}
              style={{
                borderColor:
                  "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 40%, transparent)",
                backgroundColor:
                  "var(--preview-background, hsl(var(--background)))",
                fontFamily: "var(--preview-font-heading, var(--font-heading))",
                color: "var(--preview-text, hsl(var(--foreground)))",
                borderRadius: "var(--preview-radius, 8px)",
                fontSize: "var(--preview-font-size, 16px)",
              }}
              autoFocus
            />
          ) : (
            <div
              onClick={onQuestionClick}
              className={cn(
                "font-semibold cursor-text",
                "rounded-lg px-3 py-2.5 -mx-3 -my-2.5",
                "hover:bg-muted/60 active:bg-muted/80",
                "transition-colors duration-150",
                "flex items-start gap-1.5",
                "min-h-[44px] items-center"
              )}
              style={{
                fontFamily: "var(--preview-font-heading, var(--font-heading))",
                color: "var(--preview-text, hsl(var(--foreground)))",
                fontSize: "var(--preview-font-size, 16px)",
              }}
            >
              <span className="flex-1 leading-relaxed">
                {question || "Click to add question..."}
              </span>
              {required && (
                <span className="text-destructive font-bold shrink-0">*</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          {isEditingDescription ? (
            <Textarea
              ref={descriptionRef}
              value={description || ""}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onBlur={onDescriptionBlur}
              onKeyDown={onDescriptionKeyDown}
              placeholder="Add a description (optional)..."
              className={cn(
                "resize-none min-h-[72px]",
                "border-2",
                "focus-visible:ring-2",
                "transition-all duration-200"
              )}
              style={{
                borderColor:
                  "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 40%, transparent)",
                backgroundColor:
                  "var(--preview-background, hsl(var(--background)))",
                color:
                  "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                fontFamily: "var(--preview-font-body, var(--font-body))",
                borderRadius: "var(--preview-radius, 8px)",
                fontSize: "calc(var(--preview-font-size, 16px) * 0.875)",
              }}
              rows={2}
              autoFocus
            />
          ) : (
            <div
              onClick={onDescriptionClick}
              className={cn(
                "cursor-text rounded-lg px-3 py-2 -mx-3 -my-2",
                "hover:bg-muted/60 active:bg-muted/80",
                "transition-colors duration-150",
                "min-h-[36px] flex items-center",
                !description && "italic"
              )}
              style={{
                fontFamily: "var(--preview-font-body, var(--font-body))",
                color: description
                  ? "var(--preview-text-muted, hsl(var(--muted-foreground)))"
                  : "color-mix(in srgb, var(--preview-text-muted, hsl(var(--muted-foreground))) 50%, transparent)",
                fontSize: "calc(var(--preview-font-size, 16px) * 0.875)",
              }}
            >
              {description || "Click to add description..."}
            </div>
          )}
        </div>

        {/* Field Preview Content */}
        <div className="pt-3">{children}</div>

        {/* Footer */}
        <div
          className={cn(
            "flex items-center justify-between pt-4 mt-2",
            "border-t border-border/40"
          )}
        >
          <div className="flex items-center gap-3">
            <Switch
              id={`required-${fieldId}`}
              checked={required}
              onCheckedChange={onRequiredToggle}
              className="data-[state=checked]:bg-primary"
            />
            <label
              htmlFor={`required-${fieldId}`}
              className={cn(
                "text-sm font-medium cursor-pointer select-none",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150"
              )}
            >
              Required
            </label>
          </div>

          <span
            className={cn(
              "text-[10px] text-muted-foreground/40 font-mono",
              "px-2 py-1 rounded-md bg-muted/30"
            )}
          >
            {fieldId.slice(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
}
