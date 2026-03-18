

# Two Separate Log Pages: Creative Log & Business Log

## Overview
Split the current single "Log" page into two independent log pages — **Creative Log** and **Business Log** — each with their own sidebar entry and full set of tabs (Thoughts, Quick Notes, Journal Entries).

## How It Works

Each note in the database will be tagged with a `log_category` field (`creative` or `business`). Each log page will filter to only show notes of its category. Both pages share the same underlying `systems` table and all existing functionality (pinning, search, color, export, FAB, etc.).

## Technical Plan

### 1. Database Migration
- Add a `log_category` column to the `systems` table:
  - Type: `text`, default `'creative'`, not null
  - Existing notes will default to `'creative'`

### 2. Update `useSystems` Hook
- Accept a `logCategory` parameter (`'creative' | 'business'`)
- Filter the query with `.eq('log_category', logCategory)` so each page only fetches its own notes
- Pass `log_category` when creating new notes

### 3. Create Two Log Pages
- **Rename** `SystemsView.tsx` to a reusable component (e.g., `LogView`) that accepts a `logCategory` prop
- Create `CreativeLog.tsx` and `BusinessLog.tsx` as thin wrappers that render `<LogView logCategory="creative" />` and `<LogView logCategory="business" />` with different titles/descriptions

### 4. Update Routing & Sidebar
- Replace the single `/systems` route with:
  - `/log/creative` — Creative Log
  - `/log/business` — Business Log
- Update `AppSidebar.tsx` nav items: replace the single "Log" entry with two entries (e.g., with `PenTool` and `Briefcase` icons)
- Update any references to `/systems` across the app (Dashboard GlobalSearch, etc.)

### 5. Update Global Search
- Update `GlobalSearch.tsx` to search across both log categories, labeling results as "Creative" or "Business"

### 6. Files Changed
- `supabase/migrations/` — new migration for `log_category` column
- `src/hooks/useSystems.ts` — add category filtering
- `src/pages/SystemsView.tsx` — refactor to accept `logCategory` prop
- `src/pages/CreativeLog.tsx` — new wrapper page
- `src/pages/BusinessLog.tsx` — new wrapper page
- `src/App.tsx` — update routes
- `src/components/layout/AppSidebar.tsx` — two nav items
- `src/components/dashboard/GlobalSearch.tsx` — update to handle both categories

