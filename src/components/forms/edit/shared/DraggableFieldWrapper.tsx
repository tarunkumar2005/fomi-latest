"use client";

import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandleContext } from "./FieldWrapper";

interface DraggableFieldWrapperProps {
  id: string;
  children: ReactNode;
}

export default function DraggableFieldWrapper({
  id,
  children,
}: DraggableFieldWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DragHandleContext.Provider value={{ listeners, attributes }}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </DragHandleContext.Provider>
  );
}
