# Frontend Architecture — Minimal Multi-Tenant CRM (Frontend-only)

This README describes the frontend architecture, design choices, and how to work with this repo in a frontend-only mode.

Goals
- Minimal, classic design (no excessive frameworks on UI beyond Tailwind).
- Clear component structure and separation of concerns.
- CSS Modules for component-scoped styles (classic look & easy overrides).
- `lib` contains shared client utilities and types.

Directory layout (important folders)
- `src/app/` — Next.js App Router pages and layout.
  - `page.tsx`, `layout.tsx` — app shell and global layout.
- `src/app/components/` — reusable UI components (prefer small focused components).
  - `UI.tsx` + `UI.module.css` — shared alerts, spinner, pagination (example of CSS Modules).
- `src/lib/` — client-side utilities and shared types.
  - `api-client.ts` — frontend API wrapper (can be swapped for mock implementation).
  - `types.ts` — client DTOs and request/response types.
- `src/styles/` — optional shared styles, variables, and theme tokens (use CSS Modules for components).

Folder structure (detailed)
```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    components/
      UI.tsx
      UI.module.css
      CustomerForm.tsx
      CustomerList.tsx
    customers/
      page.tsx
    users/
      page.tsx
    activity/
      page.tsx
  lib/
    api-client.ts
    types.ts
    mock-api.ts  # optional - in-memory mock for dev
  styles/
    (global tokens)
public/
package.json
FRONTEND_README.md
```

Preferred structure
```text
project-root/
|
+-- src/
|   +-- app/                    # Next.js App Router
|   |   +-- (auth)/
|   |   |   +-- login/
|   |   |   +-- register/
|   |   |
|   |   +-- dashboard/
|   |   +-- api/
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   |   +-- globals.css
|   |
|   +-- components/
|   |   +-- ui/
|   |   +-- forms/
|   |   +-- layout/
|   |   +-- shared/
|   |
|   +-- lib/
|   |   +-- supabase/
|   |   |   +-- client.ts
|   |   |   +-- server.ts
|   |   |   +-- middleware.ts
|   |   |
|   |   +-- db.ts
|   |   +-- auth.ts
|   |   +-- utils.ts
|   |
|   +-- hooks/
|   |   +-- useAuth.ts
|   |   +-- useUser.ts
|   |
|   +-- services/
|   |   +-- auth.service.ts
|   |   +-- user.service.ts
|   |   +-- product.service.ts
|   |
|   +-- types/
|   |   +-- auth.types.ts
|   |   +-- db.types.ts
|   |   +-- index.ts
|   |
|   +-- constants/
|       +-- index.ts
|
+-- public/
|
+-- .env.local
+-- middleware.ts
+-- next.config.ts
+-- tsconfig.json
+-- package.json
+-- README.md
```

Styling conventions
- Use Tailwind for utility classes where quick layout is desirable.
- Prefer CSS Modules for component-level styles for a classic, maintainable look.
  - File names: `ComponentName.module.css`
  - Import pattern in TSX: `import styles from './ComponentName.module.css'`
- Keep global theme tokens in `src/app/globals.css`.

Component design rules
- Make components small and focused (single responsibility).
- Keep state at page level; prefer prop-driven components.
- All components should be written in TypeScript with strict types.

API integration
- `src/lib/api-client.ts` abstracts HTTP requests. For a pure frontend demo, replace its methods with an in-memory or `localStorage` backed mock.

How to run
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```

How to convert a component to CSS Modules (example)
1. Create `MyComponent.module.css` next to `MyComponent.tsx`.
2. Import with `import styles from './MyComponent.module.css'`.
3. Use `className={styles.className}`.

Next steps (suggested)
- Convert other components (`CustomerList`, `CustomerForm`) to CSS Modules.
- Implement a mock API client in `src/lib/mock-api.ts` for demo mode.
- Add Storybook for component exploration (optional).

Design rationale
- CSS Modules give encapsulation and are easier to reason about than global CSS for mid-sized apps.
- Keeping Tailwind but using CSS Modules allows rapid layout while maintaining classic, maintainable component styles.

If you want, I can:
- Convert `CustomerList`/`CustomerForm` to CSS Modules now.
- Add a `src/lib/mock-api.ts` and switch `api-client` to use it in dev.
