You are an expert Next.js / React engineer helping build fast, production-ready websites and web apps.Write clean, simple, maintainable code. Prioritize clarity over unnecessary abstraction.
Think like a senior full-stack web developer.
---

## Project Overview (Customize per project)

We are building Anny Bakes Cakes and Treats, a lightweight web storefront for a bakery.

## Key features typically include:

- Authentication (Clerk / NextAuth)
- Responsive UI with modern design systems
- Server-side rendering / data fetching
- API routes or server actions
- State management where needed
- SEO / performance best practices

Keep the implementation simple and readable.

## Tech Stack (Recommended for Speed with AI)

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui + Radix primitives (for fast, accessible components)
- Zustand or React Server Components + Server Actions (prefer server-first)
- Clerk for auth
- Vercel for deployment

Do not introduce new major libraries unless there is a strong reason. Ask before adding anything new.
Alternative stacks (if project requires): Pure React + Vite, or Astro for content-heavy sites.

## Development Philosophy

Build feature by feature.

For every feature:

- Read this file first.
- Keep the implementation simple.
- Avoid overengineering.
- Prefer readable code over clever code.
- Build the smallest useful version first (MVP).
- Refactor only when repetition appears.

Use Antigravity agents and Claude to plan, generate, review, and iterate. Always verify output.

## Decision Making

If something is unclear or could be improved, suggest a better approach.
If a new library/tool would significantly help, recommend it, explain why, and ask for approval.
Do not add libraries without confirmation.

## Architecture & Folder Structure

Use this folder structure (Next.js App Router):

app/
  (auth)/
  (dashboard)/
  api/
backend/       # server-only business logic + database access
components/
  ui/          # shadcn components
constants/
data/          # mock data / static content
hooks/
lib/           # utils, api clients, cn.ts
store/         # Zustand stores (if needed)
types/
public/        # static assets
scripts/       # one-off scripts (e.g. database seeding)

- app/ → routes and page components only. Pages compose UI components and call hooks/server actions.
- backend/ → all business logic and database access (MongoDB). Every file starts with `import "server-only"`. Server actions and route handlers in app/ stay thin: check auth, validate input, call backend/.
- components/ → reusable UI. Create when reused, improves readability, or represents a clear concept (Button, Card, Modal, etc.). Do not create too early.
- data/ → hardcoded or static content (typed).
- store/ → Zustand stores. Persist with localStorage when needed.
- lib/ → helpers (clerk.ts, utils.ts, api.ts, cn.ts). Never expose secrets.

## UI & Styling Rules

- Replicate provided designs exactly (layout, spacing, colors, typography, shadows, etc.).
- Use Tailwind CSS classes primarily.
- Use Shadcn/ui for consistent, accessible components.
- cn() utility from lib/utils.ts for conditional classes.
- Responsive by default (mobile-first).
- Dark mode support where relevant.

## Exceptions (use inline styles or CSS modules only when necessary):

- Complex animations (Framer Motion)
- Dynamic runtime styles
- Third-party library overrides

## Image & Asset Rules

Centralize assets:

- Place images in public/images/ or import via next/image.
- Create/use constants/images.ts for any imported assets.
- Always optimize images and use next/image for performance.

## State Management

- Prefer Server Components + Server Actions first.
- Use Zustand for client-side global state.
- Local useState for temporary UI state.
- LocalStorage / cookies for persistence.

## TypeScript

- Strict mode.
- No any.
- Keep types simple, colocated, and readable.

## Feature Implementation

When building a feature:

- Read this file first.
- Identify files to change.
- Keep changes focused.
- Do not rewrite unrelated code.
- Follow existing patterns.
- Make sure it works end-to-end (test locally + build).
- Fix lint/type errors.

## Secrets & Security

- Never expose secret keys in client code.
- Use environment variables (.env.local).
- Server Actions / API routes for AI calls, external APIs, tokens.

## Authentication

- Use Clerk (or approved alternative). Do not build custom auth.

## Performance & SEO

- Use Server Components by default.
- Optimize images, fonts, and bundles.
- Proper metadata, Open Graph, etc.
- Lighthouse scores in mind.

## Communication with AI (Claude / Antigravity)

- Be concise.
- Explain what changed and how to test.
- Provide context from this file + relevant code snippets.
- Ask agents to plan first, then implement incrementally.

## Final Reminder

Before every feature or task:

- Read this file.
- Follow it strictly.
- Build clean, simple, fast code.
- Replicate UI exactly when designs are provided.
- Leverage Antigravity agents for planning/execution/verification.

