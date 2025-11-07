"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FormHeader from "./form-header";
import AddQuestionButton from "./add-question-button";

interface FormCanvasProps {
  formSlug: string;
}

export default function FormCanvas({ formSlug }: FormCanvasProps) {
  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

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

  return (
    <div className="h-screen overflow-hidden">
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
          <div className="px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Form Header */}
              <FormHeader
                formTitle="Customer Feedback Survey"
                formDescription="Help us improve your experience by sharing your thoughts. This survey takes approximately 3 minutes to complete."
                estimatedTime="~3 min"
                questionCount={8}
                headerImageUrl={undefined}
                onEditHeader={() => console.log("Edit header")}
                onSaveHeader={(title, description) => {
                  console.log("Save header:", { title, description });
                }}
              />

              {/* Form Fields Area - Will be dynamically rendered */}
              <div className="space-y-4">
                {/* Placeholder for form fields */}
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Form fields will be rendered here</p>
                </div>
              </div>

              {/* Add Question Button */}
              <AddQuestionButton onAddQuestion={() => console.log("Add question")} />
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
