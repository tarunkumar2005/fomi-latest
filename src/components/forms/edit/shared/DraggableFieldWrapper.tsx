"use client"

import type { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandleContext } from "./FieldWrapper"
import { cn } from "@/lib/utils"

interface DraggableFieldWrapperProps {
  id: string
  children: ReactNode
  disabled?: boolean
}

export default function DraggableFieldWrapper({ id, children, disabled = false }: DraggableFieldWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <DragHandleContext.Provider value={{ listeners: listeners as unknown as Record<string, unknown>, attributes: attributes as unknown as Record<string, unknown> }}>
      <div
        ref={setNodeRef}
        style={style}
        data-field-id={id}
        data-dragging={isDragging || undefined}
        data-over={isOver || undefined}
        className={cn(
          // Base styles
          "relative",
          "transition-all duration-200 ease-out",

          isDragging && [
            "opacity-90",
            "scale-[1.02]",
            "shadow-2xl shadow-primary/20",
            "ring-2 ring-primary/30",
            "rounded-xl",
          ],

          isOver &&
            !isDragging && [
              "before:absolute before:inset-0",
              "before:border-2 before:border-dashed before:border-primary/50",
              "before:rounded-xl before:pointer-events-none",
              "before:bg-primary/5",
            ],

          disabled && "opacity-60 pointer-events-none",
        )}
      >
        {isOver && !isDragging && (
          <div
            className={cn(
              "absolute -top-1 left-4 right-4 h-0.5",
              "bg-gradient-to-r from-transparent via-primary to-transparent",
              "rounded-full",
              "animate-pulse",
            )}
          />
        )}

        {children}
      </div>
    </DragHandleContext.Provider>
  )
}