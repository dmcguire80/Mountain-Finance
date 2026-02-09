# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Type-check (tsc -b) then build for production
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all src files
npm run format:check # Prettier check without writing
npm run type-check   # TypeScript check only (tsc --noEmit)
```

No test framework is configured.

## Firebase Deployment

```bash
firebase deploy                  # Deploy hosting + Firestore rules
firebase deploy --only hosting   # Deploy hosting only
firebase deploy --only firestore # Deploy Firestore rules/indexes only
```

**Live URLs:**
- Production: https://mountain.thorshome.xyz (custom domain)
- Default: https://mountain-finance.web.app

**Config files:** `firebase.json` (hosting + firestore), `.firebaserc` (project alias), `firestore.rules`, `firestore.indexes.json`

Pushing to `main` triggers GitHub Actions CI which automatically builds and deploys to Firebase. Manual `firebase deploy` is only needed for out-of-band changes.

**Required GitHub Secrets:** `FIREBASE_SERVICE_ACCOUNT`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials. All env vars use the `VITE_` prefix and are accessed via `import.meta.env.VITE_*`. See `FIREBASE_SETUP.md` for full Firebase project configuration.

## Architecture

**Stack:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Firebase (Auth + Firestore) + Recharts

**State management:** Two React Contexts — `AuthContext` (Firebase auth state, login/signup/logout/password reset) and `DataContext` (accounts & entries CRUD with real-time Firestore `onSnapshot` listeners). No external state library. Access via `useAuth()` and `useData()` hooks.

**Routing:** React Router v7 in `App.tsx`. All routes except `/login` are wrapped in `ProtectedRoute` which checks auth state. Pages render inside `Layout` (nav sidebar + header + dark mode toggle).

**Firestore data model:**
- `users/{userId}/accounts/{accountId}` — name, accountType, isActive, createdAt
- `users/{userId}/entries/{entryId}` — accountId (FK), value, entryDate, notes, createdAt
- Security rules enforce `request.auth.uid == userId` for all reads/writes

**Key directories:**
- `src/pages/` — route-level components (Dashboard, DataEntry, History, ManageAccounts, Import, Settings, AccountDetail, Login)
- `src/components/` — shared components (Layout, ProtectedRoute, PortfolioChart, TimeFilterBar)
- `src/context/` — AuthContext and DataContext providers
- `src/utils/` — calculations (currency formatting, chart data generation, dashboard summaries), csvParser (CSV import/validation), backup (JSON export/import)
- `src/types/index.ts` — shared TypeScript interfaces
- `src/config/firebase.ts` — Firebase app initialization

**Path alias:** `@/*` maps to `src/*` (configured in tsconfig and vite).

## Code Patterns

- Firestore batch writes (`writeBatch()`) for multi-document operations (DataEntry, Import)
- `useMemo`/`useCallback` for expensive calculations (chart data, dashboard summaries)
- Dark mode via CSS variables on `document.documentElement.classList`, persisted in localStorage, defaults to dark for new users
- CSV import supports flexible date formats (YYYY-MM-DD, MM/DD/YYYY) and currency strings ($50,000.00), auto-creates missing accounts
- Chart data fills gaps by carrying forward last known account values
- Password reset via Firebase `sendPasswordResetEmail`, exposed through `useAuth().resetPassword`

## Formatting & Style

- Prettier: single quotes, semicolons, 2-space indent, trailing commas (es5), 100 char print width
- ESLint 9 flat config with TypeScript, React, React Hooks, and React Refresh plugins
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
