import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook for managing common field editing states and handlers
 * 
 * This hook provides:
 * - Question and description editing state management
 * - Hover state tracking
 * - Advanced panel toggle (controlled externally to prevent multiple panels open)
 * - Auto-focus behavior for input fields
 * - Common keyboard shortcuts (Enter to save, Escape to cancel)
 * 
 * @param field - Field object with question and description
 * @param onUpdate - Callback to update field data
 * @param isAdvancedOpen - External controlled state for advanced panel
 * @param onAdvancedToggle - External toggle handler for advanced panel
 */
export function useFieldHandlers<T extends { question: string; description?: string }>(
  field: T,
  onUpdate: (updates: Partial<T>) => void,
  isAdvancedOpen?: boolean,
  onAdvancedToggle?: () => void
) {
  // Editing states
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Refs for auto-focus
  const questionRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingQuestion && questionRef.current) {
      questionRef.current.focus();
    }
  }, [isEditingQuestion]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditingDescription]);

  // Question handlers
  const handleQuestionChange = useCallback(
    (value: string) => {
      onUpdate({ question: value } as Partial<T>);
    },
    [onUpdate]
  );

  const handleQuestionClick = useCallback(() => {
    setIsEditingQuestion(true);
  }, []);

  const handleQuestionBlur = useCallback(() => {
    setIsEditingQuestion(false);
  }, []);

  const handleQuestionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setIsEditingQuestion(false);
      }
      if (e.key === "Escape") {
        setIsEditingQuestion(false);
      }
    },
    []
  );

  // Description handlers
  const handleDescriptionChange = useCallback(
    (value: string) => {
      onUpdate({ description: value } as Partial<T>);
    },
    [onUpdate]
  );

  const handleDescriptionClick = useCallback(() => {
    setIsEditingDescription(true);
  }, []);

  const handleDescriptionBlur = useCallback(() => {
    setIsEditingDescription(false);
  }, []);

  const handleDescriptionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setIsEditingDescription(false);
      }
      if (e.key === "Escape") {
        setIsEditingDescription(false);
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
    if (onAdvancedToggle) {
      onAdvancedToggle();
    }
  }, [onAdvancedToggle]);

  const handleAdvancedClose = useCallback(() => {
    if (onAdvancedToggle && isAdvancedOpen) {
      onAdvancedToggle();
    }
  }, [onAdvancedToggle, isAdvancedOpen]);

  return {
    // States
    isEditingQuestion,
    isEditingDescription,
    isHovered,
    isAdvancedOpen: isAdvancedOpen ?? false,

    // Refs
    questionRef,
    descriptionRef,

    // Question handlers
    handleQuestionClick,
    handleQuestionChange,
    handleQuestionBlur,
    handleQuestionKeyDown,

    // Description handlers
    handleDescriptionClick,
    handleDescriptionChange,
    handleDescriptionBlur,
    handleDescriptionKeyDown,

    // Hover handlers
    handleMouseEnter,
    handleMouseLeave,

    // Advanced panel handlers
    handleAdvancedClick,
    handleAdvancedClose,
  };
}
