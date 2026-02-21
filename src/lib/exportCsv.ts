/**
 * Convert an array of objects to CSV and trigger a download.
 */
export function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if needed
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Strip HTML tags from a string */
function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Format an idea for CSV export */
export function formatIdeaForCsv(idea: {
  title: string;
  description?: string | null;
  content?: string | null;
  status: string;
  priority: string;
  is_timely: boolean;
  scheduled_date?: string | null;
  source?: string | null;
  next_action?: string | null;
  energy_level?: string | null;
  time_estimate?: string | null;
  content_type?: { name: string } | null;
  platform?: { name: string } | null;
  created_at: string;
  updated_at: string;
}) {
  return {
    title: idea.title,
    description: idea.description || '',
    content: stripHtml(idea.content),
    status: idea.status,
    priority: idea.priority,
    is_timely: idea.is_timely ? 'Yes' : 'No',
    scheduled_date: idea.scheduled_date || '',
    source: idea.source || '',
    next_action: idea.next_action || '',
    energy_level: idea.energy_level || '',
    time_estimate: idea.time_estimate || '',
    idea_type: idea.content_type?.name || '',
    context: idea.platform?.name || '',
    created_at: idea.created_at,
    updated_at: idea.updated_at,
  };
}

/** Format a system/log note for CSV export */
export function formatSystemForCsv(note: {
  title: string;
  content?: string | null;
  note_type: string;
  mood?: string | null;
  entry_date?: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}) {
  return {
    title: note.title,
    content: stripHtml(note.content),
    type: note.note_type,
    mood: note.mood || '',
    entry_date: note.entry_date || '',
    is_pinned: note.is_pinned ? 'Yes' : 'No',
    created_at: note.created_at,
    updated_at: note.updated_at,
  };
}
