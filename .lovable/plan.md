

# Improve Sidebar Footer / User Section

The current footer area feels cluttered — avatar, name, two icon links, and two text buttons all stacked in a small space. Here's a cleaner approach:

## Design

```text
┌─────────────────────────────┐
│  [U] Username               │
│      user@email.com         │
│                             │
│  ┌─────┐┌─────┐┌─────┐┌───┐│
│  │ 📦  ││ ⚙️  ││ 🌙  ││🚪 ││
│  │Arch ││Set  ││Dark ││Out││
│  └─────┘└─────┘└─────┘└───┘│
└─────────────────────────────┘
```

## Changes (single file: `AppSidebar.tsx`)

1. **Enlarge the user info row** — Show both display name (bold, small) and email (even smaller, muted) stacked vertically. Remove the icon links from this row so it's just the avatar + text.

2. **Unify all footer actions into one icon row** — Combine Archive, Settings, Dark/Light toggle, and Sign Out into a single row of equally-spaced icon-only buttons, each with a tooltip on hover. This removes text labels ("Light", "Dark", "Sign Out") and replaces them with icons + tooltips, matching the Archive/Settings pattern already in place.

3. **Add a subtle separator** between the user info and the action icons for visual clarity.

4. **Add user email** — Pull `user.email` from the auth context (already available) to show below the display name, giving the section more purpose.

## Result
- Cleaner, more compact footer
- All actions discoverable via tooltips on hover
- Consistent icon-only pattern throughout
- User identity is clear with name + email

