"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/fomi.png";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { createFormAction } from "@/lib/form-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  LayoutDashboard,
  User,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { useSession, signOut } from "@/hooks/useSession";
import { useWorkspaces } from "@/hooks/useDashboard";
import type { Workspace } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import CreateWorkspaceModal from "@/components/dashboard/create-workspace-modal";

interface HeaderProps {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: Dispatch<SetStateAction<Workspace | null>>;
}

export default function Header({
  activeWorkspace,
  setActiveWorkspace,
}: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: workspaces } = useWorkspaces();
  const workspaceList: Workspace[] = Array.isArray(workspaces)
    ? workspaces
    : [];
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

  const handleWorkspaceChange = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
  };

  const handleNewForm = async () => {
    if (!activeWorkspace) {
      alert("Please create a workspace first");
      return;
    }

    try {
      setIsCreatingForm(true);
      const newForm = await createFormAction(
        activeWorkspace.id,
        "Untitled Form"
      );
      router.push(`/forms/${newForm.slug}/edit`);
    } catch (error) {
      console.error("Error creating form:", error);
      alert(error instanceof Error ? error.message : "Failed to create form");
    } finally {
      setIsCreatingForm(false);
    }
  };

  if (!session?.data?.user) return null;

  return (
    <TooltipProvider>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
        {/* Accent line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo & Workspace */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt="Fomi Logo"
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-heading font-semibold text-lg sm:text-xl text-foreground">
                  Fomi
                </span>
              </Link>

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-border/50" />

              {/* Workspace Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-2.5 hover:bg-muted/80 px-3 py-2 rounded-xl transition-all duration-200 outline-none border border-transparent hover:border-border/50 group">
                    <div className="p-1.5 rounded-lg bg-muted/80 group-hover:bg-muted transition-colors">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[140px] truncate">
                      {activeWorkspace?.name || "No Workspace"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72 rounded-xl shadow-xl border-border/50"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-3 py-2">
                    Workspaces
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto py-1">
                    {workspaceList.map((workspace) => (
                      <DropdownMenuItem
                        key={workspace.id}
                        className="flex items-center justify-between cursor-pointer py-2.5 px-3 mx-1 rounded-lg"
                        onClick={() => handleWorkspaceChange(workspace)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                              workspace.id === activeWorkspace?.id
                                ? "bg-primary/10"
                                : "bg-muted"
                            )}
                          >
                            <Building2
                              className={cn(
                                "h-4 w-4",
                                workspace.id === activeWorkspace?.id
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div>
                            <span className="text-sm font-medium block">
                              {workspace.name}
                            </span>
                            {workspace.description && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {workspace.description}
                              </span>
                            )}
                          </div>
                        </div>
                        {workspace.id === activeWorkspace?.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer text-primary py-2.5 px-3 mx-1 rounded-lg"
                    onClick={() => setShowCreateWorkspaceModal(true)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      Create Workspace
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* New Form Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleNewForm}
                    disabled={isCreatingForm || !activeWorkspace}
                    size="sm"
                    className={cn(
                      "h-9 px-3 sm:px-4 text-sm font-semibold rounded-xl",
                      "bg-primary hover:bg-primary/90 text-primary-foreground",
                      "shadow-sm hover:shadow-md hover:shadow-primary/20",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isCreatingForm ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                        <span className="hidden sm:inline">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Form</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {!activeWorkspace && (
                  <TooltipContent>
                    <p>Create a workspace first</p>
                  </TooltipContent>
                )}
              </Tooltip>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-muted/80 rounded-xl cursor-pointer transition-all duration-200 outline-none border border-transparent hover:border-border/50 group">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        src={session.data.user.image ?? undefined}
                        alt={session.data.user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium text-foreground max-w-[100px] truncate">
                      {session.data.user.name}
                    </span>
                    <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 rounded-xl shadow-xl border-border/50"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                        <AvatarImage
                          src={session.data.user.image ?? undefined}
                          alt={session.data.user.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                          {session.data.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {session.data.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {session.data.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <DropdownMenuItem
                      className="flex items-center gap-3 cursor-pointer rounded-lg mx-2 my-0.5 py-2.5"
                      onClick={() => router.push("/dashboard")}
                    >
                      <div className="p-1.5 rounded-md bg-muted">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-3 cursor-pointer rounded-lg mx-2 my-0.5 py-2.5"
                      onClick={() => router.push("/profile")}
                    >
                      <div className="p-1.5 rounded-md bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">
                        Profile Settings
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-3 cursor-pointer rounded-lg mx-2 my-0.5 py-2.5"
                      onClick={() => router.push("/billing")}
                    >
                      <div className="p-1.5 rounded-md bg-muted">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">Billing</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-3 cursor-pointer rounded-lg mx-2 my-0.5 py-2.5"
                      onClick={() => router.push("/settings")}
                    >
                      <div className="p-1.5 rounded-md bg-muted">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">Settings</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <div className="py-2">
                    <DropdownMenuItem
                      className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg mx-2 my-0.5 py-2.5"
                      onClick={async () => {
                        await signOut();
                      }}
                    >
                      <div className="p-1.5 rounded-md bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <CreateWorkspaceModal
          open={showCreateWorkspaceModal}
          onOpenChange={setShowCreateWorkspaceModal}
        />
      </header>
    </TooltipProvider>
  );
}
