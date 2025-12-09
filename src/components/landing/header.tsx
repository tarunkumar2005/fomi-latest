"use client"

import Link from "next/link"
import Image from "next/image";
import logo from "@/assets/fomi.png";
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { ChevronDown, LayoutDashboard, User, CreditCard, Settings, LogOut, Menu, X, Sparkles } from "lucide-react"
import { useSession, signOut } from "@/hooks/useSession"

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Demo", href: "#demo" },
  { name: "Templates", href: "#templates" },
  { name: "Pricing", href: "/pricing" },
]

const Header = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="bg-primary/10 p-2 md:p-2.5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Image src={logo} alt="Fomi Logo" className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight font-heading">Fomi</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium px-2 py-1 rounded-lg text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session && session.data ? (
            <>
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-xl cursor-pointer transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold text-foreground">{session.data.user.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                          {session.data.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{session.data.user.name}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg"
                    onClick={() => router.push("/billing")}
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={async () => {
                      await signOut()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold px-3 py-2 rounded-lg text-muted-foreground hover:text-primary"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button
                variant="default"
                size="lg"
                className="font-bold px-5 py-2 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
                onClick={() => router.push("/register")}
              >
                Start Building
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/40 py-4 px-4 shadow-lg">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium px-4 py-3 rounded-lg text-foreground hover:bg-muted hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/40">
            {session && session.data ? (
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {session.data.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">{session.data.user.name}</span>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full font-semibold justify-center"
                  onClick={() => {
                    router.push("/login")
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  className="w-full font-bold shadow-lg"
                  onClick={() => {
                    router.push("/register")
                    setMobileMenuOpen(false)
                  }}
                >
                  Start Building
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header