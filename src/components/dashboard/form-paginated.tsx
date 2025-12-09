"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MoreVertical,
  Edit,
  BarChart3,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ShareFormDialog from "@/components/forms/share-form-dialog"
import DeleteFormDialog from "@/components/forms/delete-form-dialog"

interface FormData {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
  views: number
  completions?: number
  submissions?: number
  rate?: number
  conversionRate?: number
}

interface PaginatedFormsResult {
  forms: FormData[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

interface FormPaginatedProps {
  formsData: PaginatedFormsResult | null
  isLoading: boolean
  currentPage: number
  onPageChange: (page: number) => void
}

const LoadingSkeleton = () => (
  <div className="divide-y divide-border/50">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="px-4 sm:px-6 py-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="rounded-2xl bg-muted/30 p-6 mb-4">
      <FileText className="h-12 w-12 text-muted-foreground/60" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">No forms found</h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm">
      Get started by creating your first form to collect and analyze responses.
    </p>
  </div>
)

export default function FormPaginated({ formsData, isLoading, currentPage, onPageChange }: FormPaginatedProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null)

  const filteredForms =
    formsData?.forms?.filter((form) => {
      const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || form.status === statusFilter
      return matchesSearch && matchesStatus
    }) || []

  const totalPages = formsData?.totalPages || 0
  const totalCount = formsData?.totalCount || 0
  const pageSize = formsData?.pageSize || 10
  const startIndex = formsData ? (formsData.page - 1) * pageSize + 1 : 0
  const endIndex = formsData ? Math.min(formsData.page * pageSize, totalCount) : 0

  const handleAction = (action: string, form: FormData) => {
    switch (action) {
      case "edit":
        router.push(`/forms/${form.slug}/edit`)
        break
      case "analytics":
        router.push(`/forms/${form.slug}/analytics`)
        break
      case "share":
        setSelectedForm(form)
        setShareDialogOpen(true)
        break
      case "delete":
        setSelectedForm(form)
        setDeleteDialogOpen(true)
        break
      default:
        break
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedForm) return
    setDeleteDialogOpen(false)
    setSelectedForm(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Forms Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor all your forms</p>
        </div>

        {/* Main Card */}
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">All Forms</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalCount} total forms</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-[260px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm bg-muted/50 border-border/50"
                    disabled={isLoading}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                  <SelectTrigger className="w-full sm:w-[140px] h-10 text-sm bg-muted/50 border-border/50">
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
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border/50">
              <div className="col-span-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Form
              </div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Views
              </div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Completions
              </div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Rate
              </div>
              <div className="col-span-1"></div>
            </div>

            {isLoading && <LoadingSkeleton />}

            {!isLoading && (!formsData || filteredForms.length === 0) && <EmptyState />}

            {!isLoading && filteredForms.length > 0 && (
              <div className="divide-y divide-border/50">
                {filteredForms.map((form) => {
                  const completions = form.completions ?? form.submissions ?? 0
                  const rate = form.rate ?? form.conversionRate ?? 0

                  return (
                    <div key={form.id} className="px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors group">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted/50">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{form.name}</p>
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                                  form.status === "published"
                                    ? "bg-success/10 text-success"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {form.status === "published" ? "Published" : "Unpublished"}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleAction("edit", form)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Form
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction("analytics", form)}
                                className="cursor-pointer"
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("share", form)} className="cursor-pointer">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Form
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction("delete", form)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(form.createdAt)}</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{form.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>{completions}</span>
                            </div>
                            <span className="font-semibold text-foreground">{rate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                        {/* Form Name */}
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{form.name}</p>
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                                form.status === "published"
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {form.status === "published" ? "Published" : "Unpublished"}
                            </span>
                          </div>
                        </div>

                        {/* Created */}
                        <div className="col-span-2">
                          <p className="text-sm text-foreground">{formatDate(form.createdAt)}</p>
                        </div>

                        {/* Views */}
                        <div className="col-span-1 text-center">
                          <p className="text-sm font-semibold text-foreground tabular-nums">
                            {form.views.toLocaleString()}
                          </p>
                        </div>

                        {/* Completions */}
                        <div className="col-span-2 text-center">
                          <p className="text-sm font-semibold text-foreground tabular-nums">
                            {completions.toLocaleString()}
                          </p>
                        </div>

                        {/* Rate */}
                        <div className="col-span-1">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  rate >= 70 ? "bg-success" : rate >= 50 ? "bg-chart-1" : "bg-warning",
                                )}
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-foreground tabular-nums w-12 text-right">
                              {rate.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleAction("edit", form)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Form
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction("analytics", form)}
                                className="cursor-pointer"
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("share", form)} className="cursor-pointer">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Form
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction("delete", form)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!isLoading && formsData && totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/50 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{startIndex}</span> to{" "}
                  <span className="font-medium text-foreground">{endIndex}</span> of{" "}
                  <span className="font-medium text-foreground">{totalCount}</span> forms
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        className="h-9 w-9 p-0 text-sm"
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
                    </>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => page >= currentPage - 2 && page <= currentPage + 2)
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={cn(
                          "h-9 w-9 p-0 text-sm",
                          currentPage === page && "bg-primary text-primary-foreground",
                        )}
                      >
                        {page}
                      </Button>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        className="h-9 w-9 p-0 text-sm"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedForm && (
        <ShareFormDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          formSlug={selectedForm.slug || selectedForm.id}
          formName={selectedForm.name}
        />
      )}

      {selectedForm && (
        <DeleteFormDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          formId={selectedForm.id}
          formName={selectedForm.name}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}