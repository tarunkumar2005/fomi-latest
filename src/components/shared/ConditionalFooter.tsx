"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/landing/footer";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) return null;
  return <Footer />;
}