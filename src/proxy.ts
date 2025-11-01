import { NextResponse, NextRequest } from 'next/server'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const PUBLIC_PATHS = ['/login', '/register', '/'];
const BLOCKED_PATHS = ['/forgot-password', '/reset-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path)

  if (!session && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (BLOCKED_PATHS.some((path) => pathname === path)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|.*\\.mp4$).*)',
  ],
}