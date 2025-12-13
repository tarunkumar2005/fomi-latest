"use client";

import { useState, useEffect } from "react";
import { Palette, Sliders, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeGallery from "./theme-gallery";
import ThemeCustomize from "./theme-customize";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ThemeTab = "gallery" | "customize";

interface ThemeSidebarProps {
  formId: string;
  userId?: string;
  workspaceId?: string;
  onThemeChange?: (theme: any) => void;
}

export default function ThemeSidebar({
  formId,
  userId,
  workspaceId,
  onThemeChange,
}: ThemeSidebarProps) {
  const [activeTab, setActiveTab] = useState<ThemeTab>("gallery");

  const {
    currentTheme,
    isLoading,
    builtInThemes,
    userThemes,
    workspaceThemes,
    allThemes,
    applyTheme,
    updateCurrentTheme,
    saveChanges,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
  } = useTheme({ formId, userId, workspaceId });

  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(currentTheme);
    }
  }, [currentTheme, onThemeChange]);

  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyTheme(themeId);
      toast.success("Theme applied successfully");
      setActiveTab("customize");
    } catch (error) {
      toast.error("Failed to apply theme");
    }
  };

  const handleSaveChanges = async () => {
    try {
      await saveChanges();
      toast.success("Theme changes saved");
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleReset = async () => {
    try {
      await resetTheme();
      toast.success("Theme reset to default");
    } catch (error) {
      toast.error("Failed to reset theme");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="px-4 lg:px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Theme Customizer
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize appearance
              </p>
            </div>
          </div>
          {isSaving && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              Saving...
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "gallery"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Palette className="h-4 w-4" />
            <span>Gallery</span>
          </button>
          <button
            onClick={() => setActiveTab("customize")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "customize"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="h-4 w-4" />
            <span>Customize</span>
          </button>
        </div>

        {/* Action Buttons */}
        {activeTab === "customize" && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={handleReset}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="flex-1 h-9"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset to Default
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "gallery" && (
          <ThemeGallery
            themes={allThemes}
            selectedTheme={currentTheme}
            onSelectTheme={handleApplyTheme}
            isLoading={isLoading}
          />
        )}
        {activeTab === "customize" && (
          <ThemeCustomize
            theme={currentTheme}
            onThemeChange={updateCurrentTheme}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
