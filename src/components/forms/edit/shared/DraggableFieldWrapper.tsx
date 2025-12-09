"use client"

import type { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandleContext } from "./FieldWrapper"
import { cn } from "@/lib/utils"

interface DraggableFieldWrapperProps {
  id: string
  children: ReactNode
}

export default function DraggableFieldWrapper({ id, children }: DraggableFieldWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <DragHandleContext.Provider value={{ listeners, attributes }}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn("transition-all duration-200", isDragging && "opacity-50 scale-[1.02] z-50 shadow-xl")}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  )
}