
# Restructuring CIM: From Content Manager to Creative Idea Library

## Understanding the Shift

You're evolving from a **content publishing pipeline** to a **creative thought repository**. This means the current structure (built around "when will I post this content?") needs to adapt to "what is this idea, and what might I do with it someday?"

---

## Current Structure Analysis

| Component | Current Design | Problem |
|-----------|---------------|---------|
| **Idea Types** | Blog, Podcast, Social Post, Video, Biz Dev, Automation, Inspiration | Still content-heavy |
| **Platforms** | Instagram, LinkedIn, TikTok, Twitter, Website, YouTube | Only relevant to content ideas |
| **Priorities** | Good, Better, Best | Works well, no change needed |
| **Status Workflow** | Hold → Developing → Ready → Scheduled → Archived | "Ready" and "Scheduled" assume publishing |
| **Calendar** | Shows scheduled content by publish date | Only useful for content ideas |

---

## Recommended Restructuring

### 1. Idea Types (Categories)

Replace content-specific types with broader creative categories:

| New Category | Purpose | Examples |
|--------------|---------|----------|
| **Content** | Anything meant to be published | Posts, videos, podcasts, blogs |
| **Business** | Revenue, strategy, operations | Partnership ideas, pricing models, new services |
| **Product** | Features, tools, offerings | App features, course modules, product ideas |
| **Automation** | Systems, workflows, AI assistants | Email sequences, chatbots, integrations |
| **Research** | Things to explore or learn | Competitor analysis, market trends, tutorials |
| **Inspiration** | References, motivation, aesthetics | Quotes, screenshots, "vibes", examples |
| **Personal** | Self-development, life ideas | Habits, goals, bucket list items |

### 2. "Platform" Becomes "Context" (Optional)

The concept of "where this will go" doesn't apply to all ideas. Two options:

**Option A: Make Platform Optional/Rename to "Context"**
- Rename "Platform" → "Context" or "Destination"
- Keep it optional (already is)
- Expand beyond social platforms to include:
  - Social (Instagram, LinkedIn, etc.)
  - Internal (Your team, personal use)
  - Client-facing (Proposals, presentations)
  - Product (Your app, service, course)

**Option B: Remove Platform, Add Tags Instead**
- Remove the single-select platform field
- Add a multi-select **Tags** system
- Tags can be anything: "Instagram", "Q2 launch", "revenue", "quick win"

### 3. Status Workflow Adjustment

Current statuses assume a publishing pipeline. For a broader idea library:

| Current | Proposed | Meaning |
|---------|----------|---------|
| Hold | **Captured** | Just logged, not reviewed yet |
| Developing | **Exploring** | Actively thinking about/researching |
| Ready | **Actionable** | Clear next step defined |
| Scheduled | **Planned** | Has a target date (not just for publishing) |
| Archived | Archived | Done or no longer relevant |
| Recycled | Recycled | Might revisit later |

### 4. Priority Levels

The current Good/Better/Best system works well for any idea type. No change needed.

### 5. The Calendar - Making It Work

Currently the calendar only shows "Scheduled" ideas with a publish date. For a broader idea library, the calendar could serve multiple purposes:

**Option A: Planning Calendar (Recommended)**
- Keep current behavior but rename "Scheduled" to "Planned"
- The date represents "when I want to work on or complete this"
- Works for: content publish dates, project deadlines, review dates

**Option B: Multi-Date System**
- Add multiple date fields:
  - `due_date` - when it needs to be done
  - `start_date` - when to start working
  - `review_date` - when to revisit
- More complex but more flexible

**Option C: Calendar as Review Tool**
- Add a "Next Review" date to any idea
- Calendar shows ideas that need attention on specific days
- Good for: inspiration to revisit, ideas to incubate

### 6. New Field Suggestions

Consider adding these fields to make the idea form more versatile:

| Field | Type | Purpose |
|-------|------|---------|
| **Source** | Text | Where the idea came from (podcast, conversation, shower thought) |
| **Next Action** | Text | The very next physical step to move this forward |
| **Energy Level** | Low/Medium/High | How much effort this requires |
| **Time Estimate** | Quick/Hour/Day/Week+ | Rough sizing |

---

## Technical Implementation

### Database Changes

```text
1. Update content_types table:
   - Insert new system categories
   - Keep existing ones user created

2. Consider renaming platforms → contexts:
   - Add new context options
   - Make more generic

3. Status enum update:
   - Rename 'hold' → 'captured' (or keep)
   - Rename 'developing' → 'exploring'
   - Rename 'ready' → 'actionable'
   - Rename 'scheduled' → 'planned'

4. Optional new fields on ideas:
   - source (text, nullable)
   - next_action (text, nullable)
   - energy_level (enum: low/medium/high, nullable)
```

### UI Label Changes

- "Idea Bucket" - works great as-is
- "Platform" → "Context" (if keeping the field)
- Status badges updated with new labels
- Calendar view description updated

---

## Implementation Phases

**Phase 1: Quick Wins (UI Only)**
1. Update all status labels in the UI
2. Rename "Platform" to "Context" in labels
3. Update the branding copy ("CIM" could become "Creative Idea Manager")

**Phase 2: Categories**
1. Add new system idea types to database
2. Update Settings page to reflect broader categories

**Phase 3: Context/Tags (Choose One)**
- Either expand platforms into contexts
- Or implement a tags system for flexible categorization

**Phase 4: Enhanced Fields (Optional)**
1. Add source/next_action fields
2. Update forms to include them
3. Update idea cards/views to display them

---

## Summary

The core structure is already solid. The main shifts are:

1. **Vocabulary**: Rename statuses and "Platform" to be idea-agnostic
2. **Categories**: Expand idea types beyond content
3. **Calendar**: Reframe as "planned ideas" rather than "scheduled content"
4. **Optional**: Add source/next-action fields for GTD-style capture

Would you like me to implement any of these changes?
