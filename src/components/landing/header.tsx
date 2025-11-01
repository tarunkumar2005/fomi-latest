"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/fomi.png";
import { useRouter } from "next/navigation";
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
  LogOut
} from "lucide-react";
import { useSession, signOut } from "@/hooks/useSession";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Demo", href: "#demo" },
  { name: "Templates", href: "#templates" },
  { name: "Pricing", href: "/pricing" },
];

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/50 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-transparent p-3 rounded-xl flex items-center justify-center">
            <Image src={logo} alt="Fomi Logo" className="w-8 h-8" />
          </div>
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            Fomi
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium px-2 py-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
                      <span className="text-sm font-semibold text-foreground">
                        {session.data.user.name}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2"
                >
                  {/* User Info */}
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                          {session.data.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {session.data.user.name}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Menu Items */}
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

                  {/* Logout */}
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={async () => {
                      await signOut();
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
              {/* Not Logged In */}
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
                className="font-bold px-5 py-2 rounded-xl shadow-lg"
                onClick={() => router.push("/register")}
              >
                Start Building
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;