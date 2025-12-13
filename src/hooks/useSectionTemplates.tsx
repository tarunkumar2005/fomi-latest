"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllSectionTemplates,
  searchSectionTemplates,
  getTemplateCategories,
} from "@/lib/prisma";

interface TemplateField {
  id: string;
  templateId: string;
  type: string;
  question: string;
  description: string | null;
  required: boolean;
  order: number;
  options: any;
  validation: any;
  metadata: any;
  createdAt: Date;
}

interface SectionTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  isBuiltIn: boolean;
  isPublic: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  fields: TemplateField[];
}

interface TemplateCategory {
  category: string;
  count: number;
}

// Query keys for cache management
export const sectionTemplateKeys = {
  all: ["sectionTemplates"] as const,
  templates: (category?: string, searchQuery?: string) =>
    [...sectionTemplateKeys.all, "list", { category, searchQuery }] as const,
  categories: () => [...sectionTemplateKeys.all, "categories"] as const,
};

export const useSectionTemplates = (initialCategory?: string) => {
  // Local state for filters - these trigger query refetch via queryKey
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch templates with category/search filters
  const templatesQuery = useQuery<SectionTemplate[]>({
    queryKey: sectionTemplateKeys.templates(category, searchQuery),
    queryFn: async () => {
      if (searchQuery.trim()) {
        return (await searchSectionTemplates(searchQuery)) as SectionTemplate[];
      }
      return (await getAllSectionTemplates(category)) as SectionTemplate[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - templates rarely change
    refetchOnWindowFocus: false,
  });

  // Fetch categories
  const categoriesQuery = useQuery<TemplateCategory[]>({
    queryKey: sectionTemplateKeys.categories(),
    queryFn: async () => {
      return await getTemplateCategories();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - categories change even less frequently
    refetchOnWindowFocus: false,
  });

  /**
   * Load templates by category (updates filter state)
   */
  const loadTemplates = useCallback((newCategory?: string) => {
    setCategory(newCategory);
    setSearchQuery("");
  }, []);

  /**
   * Search templates by query (updates filter state)
   */
  const searchTemplates = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      return;
    }
    setSearchQuery(query);
  }, []);

  /**
   * Filter templates by category (client-side convenience)
   */
  const filterByCategory = useCallback(
    (newCategory: string | null) => {
      loadTemplates(newCategory || undefined);
    },
    [loadTemplates]
  );

  /**
   * Reload categories
   */
  const loadCategories = useCallback(() => {
    categoriesQuery.refetch();
  }, [categoriesQuery]);

  return {
    // Data
    templates: templatesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],

    // Loading states
    isLoading: templatesQuery.isLoading,
    isFetching: templatesQuery.isFetching,
    isLoadingCategories: categoriesQuery.isLoading,

    // Error states
    error: templatesQuery.error?.message ?? null,
    categoriesError: categoriesQuery.error?.message ?? null,

    // Current filters
    currentCategory: category,
    currentSearchQuery: searchQuery,

    // Actions
    loadTemplates,
    searchTemplates,
    filterByCategory,
    loadCategories,

    // Refetch functions
    refetchTemplates: templatesQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
  };
};
