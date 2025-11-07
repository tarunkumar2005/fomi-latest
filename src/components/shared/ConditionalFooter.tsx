"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/landing/footer";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isFormRoute = pathname.startsWith("/forms");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Don't show footer on auth, forms, or dashboard routes
  if (isAuthRoute || isFormRoute || isDashboardRoute) return null;

  return <Footer />;
}
