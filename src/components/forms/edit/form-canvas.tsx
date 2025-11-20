"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  MessageSquare,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import FormHeader from "./form-header";
import AddQuestionButton from "./add-question-button";
import DraggableFieldWrapper from "./shared/DraggableFieldWrapper";
import ShortAnswerField from "../form-fields/short-answer-field";
import ParagraphField from "../form-fields/paragraph-field";
import EmailField from "../form-fields/email-field";
import NumberField from "../form-fields/number-field";
import PhoneField from "../form-fields/phone-field";
import MultipleChoiceField from "../form-fields/multiple-choice-field";
import CheckboxesField from "../form-fields/checkboxes-field";
import DropdownField from "../form-fields/dropdown-field";
import RatingField from "../form-fields/rating-field";
import LinearScaleField from "../form-fields/linear-scale-field";
import UrlField from "../form-fields/url-field";
import DateField from "../form-fields/date-field";
import TimeField from "../form-fields/time-field";
import DateRangeField from "../form-fields/date-range-field";
import FileUploadField from "../form-fields/file-upload-field";

interface FormCanvasProps {
  formSlug: string;
  formHeaderData: any;
}

export default function FormCanvas({ 
  formSlug,
  formHeaderData,
 }: FormCanvasProps) {
  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Advanced panel state - only one can be open at a time
  const [openAdvancedFieldId, setOpenAdvancedFieldId] = useState<string | null>(
    null
  );

  // Form fields state
  const [formFields, setFormFields] = useState([
    {
      id: "field-1",
      type: "short-answer",
      question: "What is your full name?",
      description: "Please enter your first and last name",
      placeholder: "Your answer here...",
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: undefined,
      customValidation: undefined,
      isHidden: false,
      gridColumns: 1,
    },
    {
      id: "field-2",
      type: "email",
      question: "What is your email address?",
      description: "We'll use this to contact you",
      placeholder: "name@example.com",
      required: true,
      pattern: undefined, // Will use default email pattern
      customValidation: undefined,
      isHidden: false,
      gridColumns: 1,
    },
    {
      id: "field-3",
      type: "paragraph",
      question: "Tell us about your experience",
      description: "Share your thoughts and feedback in detail",
      placeholder: "Write your detailed response here...",
      required: false,
      rows: 5,
      minLength: 50,
      isHidden: false,
      gridColumns: 1,
    },
    {
      id: "field-4",
      type: "number",
      question: "What is your age?",
      description: "Please enter your current age",
      placeholder: "Enter your age",
      required: true,
      min: 18,
      max: 120,
      step: 1,
      isHidden: false,
      gridColumns: 1,
    },
    {
      id: "field-5",
      type: "phone",
      question: "Phone Number",
      description: "We may contact you at this number",
      placeholder: "+1 (555) 000-0000",
      required: false,
      minLength: 10,
      maxLength: 15,
      isHidden: false,
      gridColumns: 1,
    },
    {
      id: "field-6",
      type: "multiple-choice",
      question: "What is your preferred contact method?",
      description: "Choose how you'd like us to reach you",
      placeholder: "Select your preferred option",
      required: true,
      allowMultiple: false,
      options: [
        {
          id: "opt-1",
          label: "Email",
          value: "email",
          default: true,
        },
        {
          id: "opt-2",
          label: "Phone Call",
          value: "phone_call",
          default: false,
        },
        {
          id: "opt-3",
          label: "Text Message",
          value: "text_message",
          default: false,
        },
        {
          id: "opt-4",
          label: "Video Call",
          value: "video_call",
          default: false,
        },
      ],
      isHidden: false,
      customValidation: undefined,
    },
    {
      id: "field-7",
      type: "checkboxes",
      question: "Which features are most important to you?",
      description: "Select all that apply",
      placeholder: "Choose one or more features",
      required: false,
      options: [
        {
          id: "opt-1",
          label: "Easy to use",
          value: "easy_to_use",
          default: false,
        },
        {
          id: "opt-2",
          label: "Fast performance",
          value: "fast_performance",
          default: true,
        },
        {
          id: "opt-3",
          label: "Good design",
          value: "good_design",
          default: true,
        },
        {
          id: "opt-4",
          label: "Affordable pricing",
          value: "affordable_pricing",
          default: false,
        },
        {
          id: "opt-5",
          label: "Great support",
          value: "great_support",
          default: false,
        },
      ],
      isHidden: false,
      customValidation: undefined,
    },
    {
      id: "field-8",
      type: "dropdown",
      question: "What is your current role?",
      description: "Select the option that best describes your position",
      placeholder: "Choose your role",
      required: true,
      options: [
        {
          id: "opt-1",
          label: "Software Developer",
          value: "software_developer",
          default: true,
        },
        {
          id: "opt-2",
          label: "Product Manager",
          value: "product_manager",
          default: false,
        },
        {
          id: "opt-3",
          label: "Designer",
          value: "designer",
          default: false,
        },
        {
          id: "opt-4",
          label: "Marketing Specialist",
          value: "marketing_specialist",
          default: false,
        },
        {
          id: "opt-5",
          label: "Other",
          value: "other",
          default: false,
        },
      ],
      isHidden: false,
      customValidation: undefined,
    },
    {
      id: "field-9",
      type: "rating",
      question: "How would you rate your experience?",
      description: "Your feedback helps us improve our service",
      required: false,
      maxRating: 5,
      ratingStyle: "stars" as "stars" | "numbers" | "emoji",
    },
    {
      id: "field-10",
      type: "linear-scale",
      question: "How likely are you to recommend us to a friend?",
      description: "0 = Not at all likely, 10 = Extremely likely",
      required: true,
      min: 0,
      max: 10,
      minLabel: "Not at all likely",
      maxLabel: "Extremely likely",
    },
    {
      id: "field-11",
      type: "url",
      question: "What is your website or portfolio URL?",
      description: "Please provide a link to your work",
      placeholder: "https://example.com",
      required: false,
      minLength: undefined,
      maxLength: undefined,
      pattern: undefined,
      customValidation: undefined,
    },
    {
      id: "field-12",
      type: "date",
      question: "What is your date of birth?",
      description: "We need this for verification purposes",
      required: true,
      minDate: undefined,
      maxDate: undefined,
    },
    {
      id: "field-13",
      type: "time",
      question: "What time should we call you?",
      description: "Please select your preferred time slot",
      required: false,
      minTime: undefined,
      maxTime: undefined,
    },
    {
      id: "field-14",
      type: "date-range",
      question: "Select your travel dates",
      description: "When do you plan to travel?",
      required: true,
      minDate: undefined,
      maxDate: undefined,
    },
    {
      id: "field-15",
      type: "file-upload",
      question: "Upload your resume or CV",
      description: "Please upload your most recent resume in PDF or DOC format",
      required: true,
      acceptedTypes: ".pdf,.doc,.docx",
      maxFileSize: 5242880, // 5MB
      maxFiles: 1,
      requiredFiles: 1,
    },
  ]);

  // Close sidebars on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle sidebar toggle - only one can be open at a time
  const handleLeftSidebarToggle = () => {
    if (!leftSidebarOpen && rightSidebarOpen) {
      setRightSidebarOpen(false);
    }
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const handleRightSidebarToggle = () => {
    if (!rightSidebarOpen && leftSidebarOpen) {
      setLeftSidebarOpen(false);
    }
    setRightSidebarOpen(!rightSidebarOpen);
  };

  // Field handlers
  const handleFieldUpdate = (fieldId: string, updates: any) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleFieldDelete = (fieldId: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleFieldDuplicate = (fieldId: string) => {
    const fieldToDuplicate = formFields.find((f) => f.id === fieldId);
    if (fieldToDuplicate) {
      const newField = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}`,
      };
      setFormFields((prev) => [...prev, newField]);
    }
  };

  const handleAddQuestion = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: "short-answer",
      question: "New Question",
      description: "",
      placeholder: "Your answer here...",
      required: false,
      isHidden: false,
      gridColumns: 1,
      minLength: undefined,
      maxLength: undefined,
      pattern: undefined,
      customValidation: undefined,
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const handleEnhanceField = (fieldId: string) => {
    console.log("AI Enhance triggered for field:", fieldId);
    // TODO: Implement AI enhancement
  };

  const handleAdvancedToggle = (fieldId: string) => {
    setOpenAdvancedFieldId((prev) => (prev === fieldId ? null : fieldId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormFields((fields) => {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);

        return arrayMove(fields, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="relative h-full flex">
        {/* Left Sidebar - Theme Customizer */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full bg-card border-r border-border z-20 transition-transform duration-200 ease-out",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "w-[400px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Theme options will go here
                  </p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Color picker</p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Typography settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Fomi Agent (AI Chat) */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full bg-card border-l border-border z-20 transition-transform duration-200 ease-out",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full",
            "w-[400px]"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Fomi Agent
                </h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    AI chat interface
                  </p>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Message history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Toggle Button - Desktop */}
        <button
          onClick={handleLeftSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1.5",
            "w-12 h-20 bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-r-xl shadow-lg backdrop-blur-sm",
            "hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-xl hover:w-14",
            "transition-all duration-200 ease-out group",
            leftSidebarOpen ? "left-[400px]" : "left-0"
          )}
          title={leftSidebarOpen ? "Close Theme Customizer" : "Customize Theme"}
        >
          <Settings className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {leftSidebarOpen ? (
            <ChevronLeft className="h-3.5 w-3.5 text-primary/70" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
          )}
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {leftSidebarOpen ? "Close" : "Customize Theme"}
          </span>
        </button>

        {/* Right Toggle Button - Desktop */}
        <button
          onClick={handleRightSidebarToggle}
          className={cn(
            "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1.5",
            "w-12 h-20 bg-linear-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-l-xl shadow-lg backdrop-blur-sm",
            "hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-xl hover:w-14",
            "transition-all duration-200 ease-out group",
            rightSidebarOpen ? "right-[400px]" : "right-0"
          )}
          title={rightSidebarOpen ? "Close Fomi Agent" : "Open Fomi Agent"}
        >
          <MessageSquare className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
          {rightSidebarOpen ? (
            <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-primary/70" />
          )}
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {rightSidebarOpen ? "Close" : "Ask Fomi Agent"}
          </span>
        </button>

        {/* Mobile Floating Buttons */}
        <button
          onClick={handleLeftSidebarToggle}
          className="md:hidden fixed bottom-6 left-6 z-30 w-14 h-14 bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Settings className="h-6 w-6" />
        </button>

        <button
          onClick={handleRightSidebarToggle}
          className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {/* Main Canvas Area */}
        <div
          className={cn(
            "flex-1 transition-all duration-200 ease-out overflow-y-auto bg-muted/20",
            leftSidebarOpen && "md:ml-[400px]",
            rightSidebarOpen && "md:mr-[400px]"
          )}
        >
          <div className="px-4 sm:px-6 pt-24 pb-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Form Header */}
              <FormHeader
                formTitle={formHeaderData?.form?.title || "Untitled Form"}
                formDescription={formHeaderData?.form?.description || ""}
                estimatedTime="~3 min"
                questionCount={formFields.length}
                headerImageUrl={formHeaderData?.form?.headerImageUrl || null}
                onEditHeader={() => console.log("Edit header")}
                onSaveHeader={(title, description) => {
                  console.log("Save header:", { title, description });
                }}
              />

              {/* Form Fields Area */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formFields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {formFields.map((field, index) => {
                      const commonProps = {
                        field,
                        index: index + 1,
                        onUpdate: (updates: any) =>
                          handleFieldUpdate(field.id, updates),
                        onDelete: () => handleFieldDelete(field.id),
                        onDuplicate: () => handleFieldDuplicate(field.id),
                        onEnhance: () => handleEnhanceField(field.id),
                        isAdvancedOpen: openAdvancedFieldId === field.id,
                        onAdvancedToggle: () => handleAdvancedToggle(field.id),
                      };

                      // Render field component based on type
                      let fieldComponent;

                      if (field.type === "paragraph") {
                        fieldComponent = <ParagraphField {...commonProps} />;
                      } else if (field.type === "email") {
                        fieldComponent = <EmailField {...commonProps} />;
                      } else if (field.type === "number") {
                        fieldComponent = <NumberField {...commonProps} />;
                      } else if (field.type === "phone") {
                        fieldComponent = <PhoneField {...commonProps} />;
                      } else if (field.type === "multiple-choice") {
                        fieldComponent = (
                          <MultipleChoiceField {...commonProps} />
                        );
                      } else if (field.type === "checkboxes") {
                        fieldComponent = <CheckboxesField {...commonProps} />;
                      } else if (field.type === "dropdown") {
                        fieldComponent = <DropdownField {...commonProps} />;
                      } else if (field.type === "rating") {
                        fieldComponent = <RatingField {...commonProps} />;
                      } else if (field.type === "linear-scale") {
                        fieldComponent = <LinearScaleField {...commonProps} />;
                      } else if (field.type === "url") {
                        fieldComponent = <UrlField {...commonProps} />;
                      } else if (field.type === "date") {
                        fieldComponent = <DateField {...commonProps} />;
                      } else if (field.type === "time") {
                        fieldComponent = <TimeField {...commonProps} />;
                      } else if (field.type === "date-range") {
                        fieldComponent = <DateRangeField {...commonProps} />;
                      } else if (field.type === "file-upload") {
                        fieldComponent = <FileUploadField {...commonProps} />;
                      } else {
                        // Default to short answer
                        fieldComponent = <ShortAnswerField {...commonProps} />;
                      }

                      // Wrap with DraggableFieldWrapper
                      return (
                        <DraggableFieldWrapper key={field.id} id={field.id}>
                          {fieldComponent}
                        </DraggableFieldWrapper>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Question Button */}
              <AddQuestionButton onAddQuestion={handleAddQuestion} />
            </div>
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}

        {/* Mobile Sidebars - Full Screen */}
        {leftSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-card z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground">Mobile theme options</p>
            </div>
          </div>
        )}

        {rightSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-card z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">
                  Fomi Agent
                </h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-muted-foreground">Mobile AI chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
