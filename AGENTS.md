# Agent Guidelines for Fomi

## Build, Lint, Test Commands
- **Dev**: `npm run dev` (Next.js dev server)
- **Build**: `npm run build` (Production build)
- **Lint**: `npm run lint` (ESLint)
- **No test suite**: Currently no test framework configured

## Code Style & Conventions
- **TypeScript**: Strict mode enabled. Use proper types, avoid `any`
- **Imports**: Use `@/` alias for src imports (e.g., `@/lib/utils`, `@/components/ui/button`)
- **Formatting**: Follow existing patterns (2-space indentation, double quotes for JSX props)
- **Components**: Use kebab-case for filenames (e.g., `form-header.tsx`), PascalCase for component names
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces/components, SCREAMING_SNAKE_CASE for constants
- **Client Components**: Add `"use client"` directive at top when using hooks or browser APIs
- **Error Handling**: Use try-catch in API routes, return NextResponse with proper status codes
- **Database**: Prisma ORM - use `@/lib/prisma` for db access, run migrations with `npx prisma migrate dev`
- **Styling**: Tailwind CSS with `cn()` utility from `@/lib/utils` for conditional classes
- **State**: React Query (@tanstack/react-query) for server state, React hooks for local state
- **Auth**: Better Auth library - use `@/lib/auth-client` for client, `@/lib/auth` for server

## Stack
- Next.js 16, React 19, TypeScript 5, Prisma 6, TailwindCSS 4, Radix UI, Better Auth, React Query
