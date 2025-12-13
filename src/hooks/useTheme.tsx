"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { FormTheme } from "@/types/form-theme";
import { DEFAULT_THEME } from "@/types/form-theme";
import {
  getBuiltInThemes,
  getUserThemes,
  getWorkspaceThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  duplicateTheme,
  applyThemeToForm,
  saveCustomThemeOverrides,
  getFormTheme,
  resetFormTheme,
  exportTheme,
  importTheme,
} from "@/lib/prisma";

interface UseThemeProps {
  formId: string;
  userId?: string;
  workspaceId?: string;
}

interface UseThemeReturn {
  // Current theme state
  currentTheme: FormTheme;
  isLoading: boolean;
  error: string | null;

  // Theme lists
  builtInThemes: FormTheme[];
  userThemes: FormTheme[];
  workspaceThemes: FormTheme[];
  allThemes: FormTheme[];

  // Theme actions
  applyTheme: (themeId: string) => Promise<void>;
  updateCurrentTheme: (updates: Partial<FormTheme>) => void;
  saveAsNewTheme: (name: string, description?: string) => Promise<void>;
  duplicateExistingTheme: (themeId: string, newName: string) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  resetTheme: () => Promise<void>;

  // Import/Export
  exportCurrentTheme: () => Promise<any>;
  importThemeFromJson: (jsonData: any) => Promise<void>;

  // Save changes
  saveChanges: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

  // Refresh theme lists
  refreshThemes: () => Promise<void>;
}

export function useTheme({
  formId,
  userId,
  workspaceId,
}: UseThemeProps): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<FormTheme>(DEFAULT_THEME);
  const [originalTheme, setOriginalTheme] = useState<FormTheme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [builtInThemes, setBuiltInThemes] = useState<FormTheme[]>([]);
  const [userThemes, setUserThemes] = useState<FormTheme[]>([]);
  const [workspaceThemes, setWorkspaceThemes] = useState<FormTheme[]>([]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save effect with debouncing (same as form auto-save: 800ms)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveChanges();
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    }, 800); // 800ms debounce (same as form)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [currentTheme, hasUnsavedChanges]);

  // Load all themes
  const loadThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load built-in themes
      const builtIn = await getBuiltInThemes();
      setBuiltInThemes(builtIn as any);

      // Load user themes if userId provided
      if (userId) {
        const userThemesList = await getUserThemes(userId);
        setUserThemes(userThemesList as any);
      }

      // Load workspace themes if workspaceId provided
      if (workspaceId) {
        const workspaceThemesList = await getWorkspaceThemes(workspaceId);
        setWorkspaceThemes(workspaceThemesList as any);
      }

      // Load current form theme (this returns merged theme with base + overrides)
      const formTheme = await getFormTheme(formId);
      if (formTheme) {
        const theme = formTheme as FormTheme;
        setCurrentTheme(theme);
        setOriginalTheme(theme);
      } else {
        // Use default theme if no theme is set
        const defaultTheme =
          builtIn.find((t) => t.id === "default") || DEFAULT_THEME;
        setCurrentTheme(defaultTheme as any);
        setOriginalTheme(defaultTheme as any);
      }
    } catch (err) {
      console.error("Failed to load themes:", err);
      setError("Failed to load themes");
    } finally {
      setIsLoading(false);
    }
  }, [formId, userId, workspaceId]);

  // Initial load
  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(currentTheme) !== JSON.stringify(originalTheme);
    setHasUnsavedChanges(hasChanges);
  }, [currentTheme, originalTheme]);

  // Combine all themes and remove duplicates by ID
  const allThemes = useMemo(() => {
    const themeMap = new Map<string, FormTheme>();

    // Built-in themes have priority
    builtInThemes.forEach((theme) => themeMap.set(theme.id, theme));
    // Then workspace themes
    workspaceThemes.forEach((theme) => themeMap.set(theme.id, theme));
    // Then user themes (lowest priority)
    userThemes.forEach((theme) => themeMap.set(theme.id, theme));

    return Array.from(themeMap.values());
  }, [builtInThemes, userThemes, workspaceThemes]);

  // Apply a theme to the form
  const applyTheme = useCallback(
    async (themeId: string) => {
      try {
        setIsLoading(true);
        console.log("Applying theme:", themeId);

        // Find the theme first
        const theme = allThemes.find((t) => t.id === themeId);
        if (!theme) {
          throw new Error("Theme not found");
        }

        console.log("Theme found:", theme);

        // Apply to form in database
        await applyThemeToForm(formId, themeId);
        console.log("Theme applied to database");

        // Update local state with the full theme object
        setCurrentTheme(theme);
        setOriginalTheme(theme);
        setHasUnsavedChanges(false);
        console.log("Theme state updated");
      } catch (err) {
        console.error("Failed to apply theme:", err);
        setError("Failed to apply theme");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [formId, allThemes]
  );

  // Update current theme (local state only)
  const updateCurrentTheme = useCallback((updates: Partial<FormTheme>) => {
    setCurrentTheme((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Save changes to the form (as custom overrides)
  const saveChanges = useCallback(async () => {
    try {
      setIsLoading(true);

      // Calculate the difference from original theme
      const overrides: any = {};

      if (
        JSON.stringify(currentTheme.colors) !==
        JSON.stringify(originalTheme.colors)
      ) {
        overrides.colors = currentTheme.colors;
      }
      if (
        JSON.stringify(currentTheme.typography) !==
        JSON.stringify(originalTheme.typography)
      ) {
        overrides.typography = currentTheme.typography;
      }
      if (
        JSON.stringify(currentTheme.layout) !==
        JSON.stringify(originalTheme.layout)
      ) {
        overrides.layout = currentTheme.layout;
      }
      if (
        JSON.stringify(currentTheme.buttons) !==
        JSON.stringify(originalTheme.buttons)
      ) {
        overrides.buttons = currentTheme.buttons;
      }
      if (
        JSON.stringify(currentTheme.inputFields) !==
        JSON.stringify(originalTheme.inputFields)
      ) {
        overrides.inputFields = currentTheme.inputFields;
      }

      console.log("Saving theme overrides:", overrides);

      if (Object.keys(overrides).length > 0) {
        await saveCustomThemeOverrides(formId, overrides);
        console.log("Theme overrides saved successfully");
      } else {
        console.log("No changes to save");
      }

      setOriginalTheme(currentTheme);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save changes:", err);
      setError("Failed to save changes");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [formId, currentTheme, originalTheme]);

  // Save as new theme
  const saveAsNewTheme = useCallback(
    async (name: string, description?: string) => {
      try {
        setIsLoading(true);

        const newTheme = await createTheme({
          name,
          description,
          category: "custom",
          userId,
          workspaceId,
          colors: currentTheme.colors,
          typography: currentTheme.typography,
          layout: currentTheme.layout,
          buttons: currentTheme.buttons,
          inputFields: currentTheme.inputFields,
        });

        // Refresh themes
        await loadThemes();

        // Apply the new theme
        if (newTheme.id) {
          await applyTheme(newTheme.id);
        }
      } catch (err) {
        console.error("Failed to save theme:", err);
        setError("Failed to save theme");
      } finally {
        setIsLoading(false);
      }
    },
    [currentTheme, userId, workspaceId, loadThemes, applyTheme]
  );

  // Duplicate existing theme
  const duplicateExistingTheme = useCallback(
    async (themeId: string, newName: string) => {
      try {
        setIsLoading(true);
        await duplicateTheme(themeId, newName, userId, workspaceId);
        await loadThemes();
      } catch (err) {
        console.error("Failed to duplicate theme:", err);
        setError("Failed to duplicate theme");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, workspaceId, loadThemes]
  );

  // Delete custom theme
  const deleteCustomTheme = useCallback(
    async (themeId: string) => {
      try {
        setIsLoading(true);
        await deleteTheme(themeId);
        await loadThemes();
      } catch (err) {
        console.error("Failed to delete theme:", err);
        setError("Failed to delete theme");
      } finally {
        setIsLoading(false);
      }
    },
    [loadThemes]
  );

  // Reset theme
  const resetTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      await resetFormTheme(formId);
      setCurrentTheme(DEFAULT_THEME);
      setOriginalTheme(DEFAULT_THEME);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to reset theme:", err);
      setError("Failed to reset theme");
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  // Export current theme
  const exportCurrentTheme = useCallback(async () => {
    try {
      if (!currentTheme.id) {
        throw new Error("No theme selected");
      }
      return await exportTheme(currentTheme.id);
    } catch (err) {
      console.error("Failed to export theme:", err);
      setError("Failed to export theme");
      throw err;
    }
  }, [currentTheme]);

  // Import theme from JSON
  const importThemeFromJson = useCallback(
    async (jsonData: any) => {
      try {
        setIsLoading(true);
        await importTheme(jsonData, userId, workspaceId);
        await loadThemes();
      } catch (err) {
        console.error("Failed to import theme:", err);
        setError("Failed to import theme");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, workspaceId, loadThemes]
  );

  // Refresh themes
  const refreshThemes = useCallback(async () => {
    await loadThemes();
  }, [loadThemes]);

  return {
    currentTheme,
    isLoading,
    error,
    builtInThemes,
    userThemes,
    workspaceThemes,
    allThemes,
    applyTheme,
    updateCurrentTheme,
    saveAsNewTheme,
    duplicateExistingTheme,
    deleteCustomTheme,
    resetTheme,
    exportCurrentTheme,
    importThemeFromJson,
    saveChanges,
    hasUnsavedChanges,
    isSaving,
    refreshThemes,
  };
}
