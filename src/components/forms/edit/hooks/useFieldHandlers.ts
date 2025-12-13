"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";

interface FieldBase {
  id: string;
  question: string;
  description?: string;
}

export function useFieldHandlers<T extends FieldBase>(
  field: T,
  onUpdate: (updates: Partial<T>) => void,
  isAdvancedOpen?: boolean,
  onAdvancedToggle?: () => void
) {
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Local state for editing - syncs from props but allows local edits
  const [localQuestion, setLocalQuestion] = useState(field.question);
  const [localDescription, setLocalDescription] = useState(
    field.description || ""
  );

  // Sync from props when field changes (e.g., after save, initial load, or AI enhancement)
  // Always sync to ensure AI enhancements and other external updates are reflected
  useEffect(() => {
    setLocalQuestion(field.question);
  }, [field.question]);

  useEffect(() => {
    setLocalDescription(field.description || "");
  }, [field.description]);

  const questionRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Question handlers
  const handleQuestionClick = useCallback(() => {
    setIsEditingQuestion(true);
    setTimeout(() => questionRef.current?.focus(), 0);
  }, []);

  const handleQuestionChange = useCallback(
    (value: string) => {
      setLocalQuestion(value); // Update local state immediately
      onUpdate({ question: value } as Partial<T>); // Trigger debounced save
    },
    [onUpdate]
  );

  const handleQuestionBlur = useCallback(() => {
    setIsEditingQuestion(false);
  }, []);

  const handleQuestionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Escape") {
        setIsEditingQuestion(false);
        questionRef.current?.blur();
      }
    },
    []
  );

  // Description handlers
  const handleDescriptionClick = useCallback(() => {
    setIsEditingDescription(true);
    setTimeout(() => descriptionRef.current?.focus(), 0);
  }, []);

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setLocalDescription(value); // Update local state immediately
      onUpdate({ description: value || undefined } as Partial<T>); // Trigger debounced save
    },
    [onUpdate]
  );

  const handleDescriptionBlur = useCallback(() => {
    setIsEditingDescription(false);
  }, []);

  const handleDescriptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setIsEditingDescription(false);
        descriptionRef.current?.blur();
      }
    },
    []
  );

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Advanced panel handlers
  const handleAdvancedClick = useCallback(() => {
    onAdvancedToggle?.();
  }, [onAdvancedToggle]);

  const handleAdvancedClose = useCallback(() => {
    if (isAdvancedOpen) {
      onAdvancedToggle?.();
    }
  }, [isAdvancedOpen, onAdvancedToggle]);

  return {
    isEditingQuestion,
    isEditingDescription,
    isHovered,
    localQuestion,
    localDescription,
    questionRef,
    descriptionRef,
    handleQuestionClick,
    handleQuestionChange,
    handleQuestionBlur,
    handleQuestionKeyDown,
    handleDescriptionClick,
    handleDescriptionChange,
    handleDescriptionBlur,
    handleDescriptionKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    handleAdvancedClick,
    handleAdvancedClose,
  };
}
