# 🧠 Claude Agent Instruction – Project Task Guide for matanuska

**Workspace:** @heinrichnel ➜ /workspaces/matanuska (main)

## 🧾 Project Summary

This project is a monorepo for transport and logistics, featuring full-stack integration with:

- **Frontend:** Vite + React + TypeScript
- **State:** React Context API (e.g., TripContext, TyreContext)
- **Forms:** React Hook Form (Zod/Yup validation)
- **Mobile:** Capacitor
- **Backend:** Firebase (Firestore + Cloud Functions)
- **AI Agents:** Claude Dev Experimental + Kilo Agent
- **UI:** TailwindCSS, modular forms, dashboards, Wialon SDK maps

## 🧱 Project Architecture Overview

### 🗂️ Directory Structure Highlights

```
src/
├── pages/              # Main routed pages (by domain)
├── components/         # UI blocks, forms, modals, cards
├── forms/              # Embedded forms ONLY – not pages
├── context/            # React state contexts
├── hooks/              # useX hooks for data, side effects
├── api/                # Firebase, Wialon, Sage APIs
├── utils/              # Shared utilities, validators, etc.
├── config/             # Sidebar, routes, workflow configs
├── firebase.ts         # Core Firebase entry
functions/              # Cloud Functions (outside /src)
```

### 🚦 Routing & Navigation Rules

- Entry: `AppRoutes.tsx`
- Config: `config/sidebarConfig.ts`
- All routes must match a valid file in `src/pages`
- Forms inside `components/forms/**` must not be routed directly

**Validation Tools:**

```
npm run test:sidebar     # Warn if Sidebar.tsx links to missing page
npm run test:routing     # Audit AppRoutes.tsx vs pages
```

## ✅ Claude Agent Tasks (as defined for kodu-ai.claude-dev-experimental)

### 🧩 Task 1 – Verify Page Implementation

- Loop through all files in `src/pages/`
- Ensure each is imported in `AppRoutes.tsx`
- Check layout wrapping via `Layout.tsx`
- Match sidebar config paths

### 🧩 Task 2 – Confirm Form Integration

- Loop through `components/forms/**/*.tsx`
- Ensure none are routed directly
- Confirm they are rendered inside page-level components like `TripManagementPage.tsx`, `DriverManagementPage.tsx`, etc.
- Match Tailwind structure:
  ```jsx
  <h2 className="text-base font-semibold text-gray-900">Form Title</h2>
  <p className="text-sm text-gray-600">Subtitle</p>
  ```

### 🧩 Task 3 – Detect Unused Files

- Use `npm run analyze:unused` to generate `unused.json`
- Review and list:
  - Orphaned modals
  - Unlinked cards
  - Duplicate forms/hooks/types

### 🧩 Task 4 – Firebase Readiness

- Confirm:
  - `firebase.ts` is used and imported
  - `firebaseConfig.ts` has valid values
  - `/api` proxy config exists in `vite.config.ts`
  - `functions/` folder contains deployable Cloud Functions

### 🧩 Task 5 – Claude Instruction Compliance

- All `*.tsx` pages import their matching context, types, hooks
- Claude should obey:
  - `layoutEnforce`
  - `sidebarCheck`
  - `routeCheck`
  - `firestoreBackend`
- `Wialonintergration`
-

## 🔁 Claude Agent Output Expectations

When this file is referenced, Claude must:

- Scan actual files (no mock)
- Use real `src/index.ts`, `context/*`, `types/*`
- Propose valid refactors, not placeholder suggestions
- Inject directly in `.tsx` files where needed
- Never scaffold pages for embedded-only components (e.g., forms/cards)

## 🔒 Rules to Enforce

❌ **Never allow direct routing to files in:**

- `/components/forms/`
- `/components/cards/`
- `/components/modals/`

✅ **Always match form usage to `pages/*` parent layout**
✅ **All page components must use layout wrappers**
✅ **All Firebase collections used in context must exist or be mocked**
