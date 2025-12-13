"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Query keys for cache management
export const themeKeys = {
  all: ["themes"] as const,
  builtIn: () => [...themeKeys.all, "builtIn"] as const,
  user: (userId: string) => [...themeKeys.all, "user", userId] as const,
  workspace: (workspaceId: string) =>
    [...themeKeys.all, "workspace", workspaceId] as const,
  form: (formId: string) => [...themeKeys.all, "form", formId] as const,
};

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
  const queryClient = useQueryClient();

  // Local state for current theme modifications (optimistic updates)
  const [currentTheme, setCurrentTheme] = useState<FormTheme>(DEFAULT_THEME);
  const [originalTheme, setOriginalTheme] = useState<FormTheme>(DEFAULT_THEME);

  // Use ref for unsaved changes to avoid re-renders on every change
  const hasUnsavedChangesRef = useRef(false);
  // Only use state for exposing to consumers when they need to react to it
  const [hasUnsavedChangesState, setHasUnsavedChangesState] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ===================
  // QUERIES
  // ===================

  // Fetch built-in themes
  const builtInQuery = useQuery<FormTheme[]>({
    queryKey: themeKeys.builtIn(),
    queryFn: async () => {
      return (await getBuiltInThemes()) as unknown as FormTheme[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - built-in themes never change
    refetchOnWindowFocus: false,
  });

  // Fetch user themes
  const userQuery = useQuery<FormTheme[]>({
    queryKey: themeKeys.user(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return (await getUserThemes(userId)) as unknown as FormTheme[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch workspace themes
  const workspaceQuery = useQuery<FormTheme[]>({
    queryKey: themeKeys.workspace(workspaceId || ""),
    queryFn: async () => {
      if (!workspaceId) return [];
      return (await getWorkspaceThemes(workspaceId)) as unknown as FormTheme[];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch form's current theme
  const formThemeQuery = useQuery<FormTheme | null>({
    queryKey: themeKeys.form(formId),
    queryFn: async () => {
      const theme = await getFormTheme(formId);
      return theme as FormTheme | null;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  // Sync form theme to local state when it changes
  useEffect(() => {
    if (formThemeQuery.data) {
      setCurrentTheme(formThemeQuery.data);
      setOriginalTheme(formThemeQuery.data);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChangesState(false);
    } else if (builtInQuery.data?.length) {
      const defaultTheme =
        builtInQuery.data.find((t) => t.id === "default") || DEFAULT_THEME;
      setCurrentTheme(defaultTheme);
      setOriginalTheme(defaultTheme);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChangesState(false);
    }
  }, [formThemeQuery.data, builtInQuery.data]);

  // ===================
  // MUTATIONS
  // ===================

  // Apply theme mutation
  const applyThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      await applyThemeToForm(formId, themeId);
      return themeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.form(formId) });
    },
  });

  // Save overrides mutation
  const saveOverridesMutation = useMutation({
    mutationFn: async (overrides: any) => {
      await saveCustomThemeOverrides(formId, overrides);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.form(formId) });
    },
  });

  // Create theme mutation
  const createThemeMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      return await createTheme({
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
    },
    onSuccess: (newTheme) => {
      // Invalidate relevant caches
      if (userId) {
        queryClient.invalidateQueries({ queryKey: themeKeys.user(userId) });
      }
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: themeKeys.workspace(workspaceId),
        });
      }
    },
  });

  // Duplicate theme mutation
  const duplicateThemeMutation = useMutation({
    mutationFn: async ({
      themeId,
      newName,
    }: {
      themeId: string;
      newName: string;
    }) => {
      return await duplicateTheme(themeId, newName, userId, workspaceId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: themeKeys.user(userId) });
      }
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: themeKeys.workspace(workspaceId),
        });
      }
    },
  });

  // Delete theme mutation
  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      await deleteTheme(themeId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: themeKeys.user(userId) });
      }
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: themeKeys.workspace(workspaceId),
        });
      }
    },
  });

  // Reset theme mutation
  const resetThemeMutation = useMutation({
    mutationFn: async () => {
      await resetFormTheme(formId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.form(formId) });
      setCurrentTheme(DEFAULT_THEME);
      setOriginalTheme(DEFAULT_THEME);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChangesState(false);
    },
  });

  // Import theme mutation
  const importThemeMutation = useMutation({
    mutationFn: async (jsonData: any) => {
      await importTheme(jsonData, userId, workspaceId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: themeKeys.user(userId) });
      }
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: themeKeys.workspace(workspaceId),
        });
      }
    },
  });

  // ===================
  // DERIVED STATE
  // ===================

  const builtInThemes = builtInQuery.data ?? [];
  const userThemes = userQuery.data ?? [];
  const workspaceThemes = workspaceQuery.data ?? [];

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

  const isLoading =
    builtInQuery.isLoading ||
    userQuery.isLoading ||
    workspaceQuery.isLoading ||
    formThemeQuery.isLoading;

  const error =
    builtInQuery.error?.message ||
    userQuery.error?.message ||
    workspaceQuery.error?.message ||
    formThemeQuery.error?.message ||
    null;

  const isSaving =
    applyThemeMutation.isPending ||
    saveOverridesMutation.isPending ||
    createThemeMutation.isPending ||
    duplicateThemeMutation.isPending ||
    deleteThemeMutation.isPending ||
    resetThemeMutation.isPending;

  // ===================
  // AUTO-SAVE EFFECT
  // ===================

  // Create a stable reference to currentTheme for the effect
  const currentThemeRef = useRef(currentTheme);
  currentThemeRef.current = currentTheme;

  const originalThemeRef = useRef(originalTheme);
  originalThemeRef.current = originalTheme;

  useEffect(() => {
    if (!hasUnsavedChangesRef.current) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveChangesInternal();
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 800); // 800ms debounce (same as form)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [currentTheme]);

  // Internal save function that uses refs
  const saveChangesInternal = useCallback(async () => {
    const current = currentThemeRef.current;
    const original = originalThemeRef.current;

    // Calculate the difference from original theme
    const overrides: any = {};

    if (JSON.stringify(current.colors) !== JSON.stringify(original.colors)) {
      overrides.colors = current.colors;
    }
    if (
      JSON.stringify(current.typography) !== JSON.stringify(original.typography)
    ) {
      overrides.typography = current.typography;
    }
    if (JSON.stringify(current.layout) !== JSON.stringify(original.layout)) {
      overrides.layout = current.layout;
    }
    if (JSON.stringify(current.buttons) !== JSON.stringify(original.buttons)) {
      overrides.buttons = current.buttons;
    }
    if (
      JSON.stringify(current.inputFields) !==
      JSON.stringify(original.inputFields)
    ) {
      overrides.inputFields = current.inputFields;
    }

    console.log("Saving theme overrides:", overrides);

    if (Object.keys(overrides).length > 0) {
      await saveOverridesMutation.mutateAsync(overrides);
      console.log("Theme overrides saved successfully");
    } else {
      console.log("No changes to save");
    }

    setOriginalTheme(current);
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChangesState(false);
  }, [saveOverridesMutation]);

  // ===================
  // ACTIONS
  // ===================

  // Apply a theme to the form
  const applyTheme = useCallback(
    async (themeId: string) => {
      console.log("Applying theme:", themeId);

      // Find the theme first
      const theme = allThemes.find((t) => t.id === themeId);
      if (!theme) {
        throw new Error("Theme not found");
      }

      console.log("Theme found:", theme);

      // Apply to form in database
      await applyThemeMutation.mutateAsync(themeId);
      console.log("Theme applied to database");

      // Update local state with the full theme object
      setCurrentTheme(theme);
      setOriginalTheme(theme);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChangesState(false);
      console.log("Theme state updated");
    },
    [allThemes, applyThemeMutation]
  );

  // Update current theme (local state only) - doesn't trigger re-renders
  const updateCurrentTheme = useCallback((updates: Partial<FormTheme>) => {
    setCurrentTheme((prev) => ({ ...prev, ...updates }));
    hasUnsavedChangesRef.current = true;
    // Only update state when needed for UI feedback (debounced)
    // setHasUnsavedChangesState(true); - removed to prevent re-renders
  }, []);

  // Save changes to the form (as custom overrides) - public version
  const saveChanges = useCallback(async () => {
    await saveChangesInternal();
  }, [saveChangesInternal]);

  // Save as new theme
  const saveAsNewTheme = useCallback(
    async (name: string, description?: string) => {
      const newTheme = await createThemeMutation.mutateAsync({
        name,
        description,
      });

      // Apply the new theme
      if (newTheme.id) {
        await applyTheme(newTheme.id);
      }
    },
    [createThemeMutation, applyTheme]
  );

  // Duplicate existing theme
  const duplicateExistingTheme = useCallback(
    async (themeId: string, newName: string) => {
      await duplicateThemeMutation.mutateAsync({ themeId, newName });
    },
    [duplicateThemeMutation]
  );

  // Delete custom theme
  const deleteCustomTheme = useCallback(
    async (themeId: string) => {
      await deleteThemeMutation.mutateAsync(themeId);
    },
    [deleteThemeMutation]
  );

  // Reset theme
  const resetTheme = useCallback(async () => {
    await resetThemeMutation.mutateAsync();
  }, [resetThemeMutation]);

  // Export current theme
  const exportCurrentTheme = useCallback(async () => {
    if (!currentTheme.id) {
      throw new Error("No theme selected");
    }
    return await exportTheme(currentTheme.id);
  }, [currentTheme]);

  // Import theme from JSON
  const importThemeFromJson = useCallback(
    async (jsonData: any) => {
      await importThemeMutation.mutateAsync(jsonData);
    },
    [importThemeMutation]
  );

  // Refresh themes
  const refreshThemes = useCallback(async () => {
    await Promise.all([
      builtInQuery.refetch(),
      userQuery.refetch(),
      workspaceQuery.refetch(),
      formThemeQuery.refetch(),
    ]);
  }, [builtInQuery, userQuery, workspaceQuery, formThemeQuery]);

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
    hasUnsavedChanges: hasUnsavedChangesRef.current,
    isSaving,
    refreshThemes,
  };
}
