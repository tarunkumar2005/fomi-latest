"use client";

import { useState, useEffect } from "react";
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

export const useSectionTemplates = () => {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all templates, optionally filtered by category
   */
  const loadTemplates = async (category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllSectionTemplates(category);
      setTemplates(data as SectionTemplate[]);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search templates by query
   */
  const searchTemplates = async (query: string) => {
    if (!query.trim()) {
      return loadTemplates();
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await searchSectionTemplates(query);
      setTemplates(data as SectionTemplate[]);
    } catch (err) {
      console.error("Failed to search templates:", err);
      setError("Failed to search templates");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load template categories with counts
   */
  const loadCategories = async () => {
    try {
      const data = await getTemplateCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  /**
   * Filter templates by category (client-side)
   */
  const filterByCategory = (category: string | null) => {
    if (!category) {
      loadTemplates();
    } else {
      loadTemplates(category);
    }
  };

  // Load templates and categories on mount
  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  return {
    templates,
    categories,
    isLoading,
    error,
    loadTemplates,
    searchTemplates,
    filterByCategory,
    loadCategories,
  };
};
