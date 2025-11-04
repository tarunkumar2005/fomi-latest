"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/fomi.png";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
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
  ChevronDown,
  LayoutDashboard,
  User,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Check,
  Plus,
} from "lucide-react";
import { useSession, signOut } from "@/hooks/useSession";
import { useWorkspaces } from "@/hooks/useDashboard";
import { Workspace } from "@/types/dashboard";

export default function Header({
  activeWorkspace,
  setActiveWorkspace,
}: {
  activeWorkspace: Workspace;
  setActiveWorkspace: Dispatch<SetStateAction<Workspace | null>>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: workspaces = [] } = useWorkspaces();

  const handleWorkspaceChange = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
  };

  const handleNewForm = () => {
    router.push("/dashboard/forms/new");
  };

  if (!session?.data?.user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-lg bg-primary/5">
                <Image
                  src={logo}
                  alt="Fomi Logo"
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Fomi
              </span>
            </Link>

            {/* Workspace Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-1.5 hover:bg-muted px-2.5 py-1.5 rounded-md transition-colors outline-none">
                  <span className="font-body text-xs text-muted-foreground">
                    Workspace:
                  </span>
                  <span className="font-body text-sm font-medium text-foreground">
                    {activeWorkspace.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  Switch Workspace
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleWorkspaceChange(workspace)}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body text-sm font-medium">
                        {workspace.name}
                      </span>
                    </div>
                    {workspace.id === activeWorkspace.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-primary"
                  onClick={() => router.push("/dashboard/workspaces/new")}
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-body text-sm font-medium">
                    Create Workspace
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* New Form Button */}
            <Button
              onClick={handleNewForm}
              size="sm"
              className="h-8 px-3 font-body text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">New Form</span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors outline-none">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage
                      src={session.data.user.image ?? undefined}
                      alt={session.data.user.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold font-heading">
                      {session.data.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block font-body text-sm font-semibold text-foreground">
                    {session.data.user.name}
                  </span>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info */}
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={session.data.user.image ?? undefined}
                        alt={session.data.user.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold font-heading text-base">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-body text-sm font-semibold text-foreground">
                        {session.data.user.name}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">
                    Dashboard
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">
                    Profile Settings
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => router.push("/billing")}
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">Billing</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">
                    Settings
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-body text-sm font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
