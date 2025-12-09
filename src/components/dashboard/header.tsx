"use client"

import Image from "next/image";
import Link from "next/link"
import logo from "@/assets/fomi.png";
import { useRouter } from "next/navigation"
import { type Dispatch, type SetStateAction, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Sparkles,
} from "lucide-react"
import { useSession, signOut } from "@/hooks/useSession"
import { useWorkspaces } from "@/hooks/useDashboard"
import type { Workspace } from "@/types/dashboard"

export default function Header({
  activeWorkspace,
  setActiveWorkspace,
}: {
  activeWorkspace: Workspace
  setActiveWorkspace: Dispatch<SetStateAction<Workspace | null>>
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: workspaces = [] } = useWorkspaces()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleWorkspaceChange = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
  }

  const handleNewForm = () => {
    router.push("/dashboard/forms/new")
  }

  if (!session?.data?.user) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                <Image src={logo} alt="Fomi Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
                <div className="absolute inset-0 rounded-xl bg-primary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="font-semibold text-lg sm:text-xl text-foreground">Fomi</span>
            </Link>

            {/* Workspace Selector - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-2 hover:bg-muted/80 px-3 py-2 rounded-lg transition-all duration-200 outline-none border border-transparent hover:border-border/50">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {activeWorkspace.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Workspaces
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    className="flex items-center justify-between cursor-pointer py-2.5"
                    onClick={() => handleWorkspaceChange(workspace)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">{workspace.name}</span>
                    </div>
                    {workspace.id === activeWorkspace.id && (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-3 cursor-pointer text-primary py-2.5"
                  onClick={() => router.push("/dashboard/workspaces/new")}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Create Workspace</span>
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
              className="h-9 px-3 sm:px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Form</span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-muted/80 rounded-xl cursor-pointer transition-all duration-200 outline-none border border-transparent hover:border-border/50">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-background shadow-sm">
                    <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {session.data.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {session.data.user.name}
                  </span>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {/* User Info Card */}
                <div className="px-3 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.data.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.data.user.email || "No email"}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer py-2.5 mx-2 rounded-lg"
                    onClick={() => router.push("/dashboard")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer py-2.5 mx-2 rounded-lg"
                    onClick={() => router.push("/profile")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer py-2.5 mx-2 rounded-lg"
                    onClick={() => router.push("/billing")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Billing</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer py-2.5 mx-2 rounded-lg"
                    onClick={() => router.push("/settings")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Settings</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                {/* Logout */}
                <div className="py-2">
                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer py-2.5 mx-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={async () => {
                      await signOut()
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
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
    </header>
  )
}