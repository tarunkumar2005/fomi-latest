"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  Edit,
  BarChart3,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock form data
const formsData = [
  {
    id: 1,
    name: "Customer Feedback Survey",
    status: "published",
    createdAt: "Oct 11, 2025",
    views: 1245,
    completions: 892,
    rate: 71.6
  },
  {
    id: 2,
    name: "Event Participation Form",
    status: "published",
    createdAt: "Oct 10, 2025",
    views: 856,
    completions: 623,
    rate: 72.8
  },
  {
    id: 3,
    name: "Newsletter Signup",
    status: "unpublished",
    createdAt: "Oct 9, 2025",
    views: 432,
    completions: 156,
    rate: 36.1
  },
  {
    id: 4,
    name: "Contact Form",
    status: "published",
    createdAt: "Oct 8, 2025",
    views: 2341,
    completions: 1567,
    rate: 66.9
  },
  {
    id: 5,
    name: "Job Application Form",
    status: "published",
    createdAt: "Oct 7, 2025",
    views: 678,
    completions: 445,
    rate: 65.6
  },
  {
    id: 6,
    name: "Product Inquiry",
    status: "unpublished",
    createdAt: "Oct 6, 2025",
    views: 234,
    completions: 89,
    rate: 38.0
  },
  {
    id: 7,
    name: "Registration Form",
    status: "published",
    createdAt: "Oct 5, 2025",
    views: 1567,
    completions: 1123,
    rate: 71.7
  },
  {
    id: 8,
    name: "Support Ticket",
    status: "published",
    createdAt: "Oct 4, 2025",
    views: 987,
    completions: 654,
    rate: 66.3
  },
];

export default function FormPaginated() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const itemsPerPage = 8;

  // Filter forms
  const filteredForms = formsData.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = filteredForms.slice(startIndex, endIndex);

  const handleAction = (action: string, formName: string) => {
    console.log(`${action} - ${formName}`);
  };

  return (
    <div className="px-4 sm:px-6 py-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Forms Overview
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Manage and monitor all your forms
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                All Forms
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-[280px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 font-body text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 font-body text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-y border-border">
              <div className="col-span-4 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Form Name
              </div>
              <div className="col-span-2 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Created
              </div>
              <div className="col-span-1 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                Views
              </div>
              <div className="col-span-2 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                Completions
              </div>
              <div className="col-span-2 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Rate
              </div>
              <div className="col-span-1 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                Actions
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {currentForms.map((form) => (
                <div
                  key={form.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/20 transition-colors group"
                >
                  {/* Form Name */}
                  <div className="col-span-4 flex flex-col justify-center">
                    <p className="font-body text-sm font-semibold text-foreground mb-1">
                      {form.name}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium font-body",
                        form.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {form.status === "published" ? "Published" : "Unpublished"}
                    </span>
                  </div>

                  {/* Created */}
                  <div className="col-span-2 flex items-center">
                    <p className="font-body text-sm text-foreground">
                      {form.createdAt}
                    </p>
                  </div>

                  {/* Views */}
                  <div className="col-span-1 flex items-center justify-center">
                    <p className="font-body text-sm font-semibold text-foreground">
                      {form.views.toLocaleString()}
                    </p>
                  </div>

                  {/* Completions */}
                  <div className="col-span-2 flex items-center justify-center">
                    <p className="font-body text-sm font-semibold text-foreground">
                      {form.completions.toLocaleString()}
                    </p>
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-xs font-semibold text-foreground">
                          {form.rate}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            form.rate >= 70
                              ? "bg-green-500"
                              : form.rate >= 50
                                ? "bg-blue-500"
                                : "bg-orange-500"
                          )}
                          style={{ width: `${form.rate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleAction("Edit", form.name)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          <span className="font-body text-sm">Edit Form</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("Analytics", form.name)}
                          className="cursor-pointer"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="font-body text-sm">View Analytics</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("Share", form.name)}
                          className="cursor-pointer"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          <span className="font-body text-sm">Share Form</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleAction("Delete", form.name)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span className="font-body text-sm">Delete Form</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="font-body text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredForms.length)} of {filteredForms.length} forms
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 p-0 font-body text-sm",
                      currentPage === page && "bg-primary text-primary-foreground"
                    )}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}