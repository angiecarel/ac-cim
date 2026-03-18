

# Streamline Log Flow: Merge Thoughts + Quick Notes, Promote to Idea

## What Changes

1. **Merge Thoughts and Quick Notes into a single "Notes" type** — the current `thought` and `quick_thought` note types become one unified "Notes" tab. Notes can optionally have a body, color, linked idea, and platform — they grow richer as needed. The inline input stays for fast capture; clicking a note opens it for editing with optional body/color.

2. **"Promote to Idea" replaces "Send to Bucket"** — when promoting, the note's data creates an Idea in the Bucket (with the correct `idea_category` matching the log's category), then the note is **deleted** from the Log. No duplication.

3. **Keep two tabs: Notes and Journal Entries** — Journal Entries remain separate for reflective writing with mood and rich text. "Move to Journal" converts a Note into a Journal Entry (current behavior). "Move to Notes" converts a Journal Entry back.

4. **Quick Capture FAB** simplifies to two options: Note or Journal Entry.

---

## Technical Plan

### 1. Unify Note Types in the Database
- No schema change needed — we keep the `note_type` column but treat `thought` and `quick_thought` as equivalent. In code, we'll query both types together for the "Notes" tab and standardize new notes to use `quick_thought` (since it supports body/color).
- Migrate existing `thought` entries to `quick_thought` via a data update so they appear in the unified Notes tab.

### 2. Update LogView.tsx
- Remove the Thoughts tab. Rename "Quick Notes" tab to "Notes".
- The "Notes" tab shows all `quick_thought` entries (which now includes former thoughts).
- The inline thought input at the top of the Notes tab stays for quick capture — creates a `quick_thought` with just a title.
- Keep the Journal Entries tab as-is.

### 3. Update "Send to Bucket" → "Promote to Idea"
- Rename the action and icon across ThoughtCard, QuickNoteCard, and JournalNoteCard.
- On promote: create an Idea (title, description from content, `idea_category` matching `log_category`), then **delete** the note from the systems table.
- Show a success toast with the idea title.

### 4. Update QuickCaptureDialog (FAB)
- Remove the three-way toggle (Thought / Quick Note / Journal).
- Replace with two options: "Note" (`quick_thought`) and "Journal Entry" (`journal_entry`).

### 5. Update "Move to" Options
- From Notes: "Move to Journal Entry" (changes `note_type` to `journal_entry`).
- From Journal: "Move to Note" (changes `note_type` to `quick_thought`).
- Remove the current "Move to Quick Note" / "Move to Journal Entry" / "Move to Thought" three-way options.

### 6. Files Changed
- `src/pages/LogView.tsx` — remove Thoughts tab, merge into Notes, update promote logic
- `src/components/journal/QuickCaptureDialog.tsx` — simplify to 2 types
- `src/components/journal/ThoughtCard.tsx` — remove or merge into QuickNoteCard
- `src/components/journal/QuickNoteCard.tsx` — add inline title-only display mode, rename Send to Bucket → Promote
- `src/components/journal/JournalNoteCard.tsx` — rename Send to Bucket → Promote
- Data migration: update existing `thought` records to `quick_thought`

