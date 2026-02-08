/**
 * Zapier webhook utilities for triggering automations
 */

interface ZapierPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Trigger a Zapier webhook with event data
 */
export async function triggerZapierWebhook(
  webhookUrl: string,
  event: string,
  data: Record<string, any>
) {
  if (!webhookUrl) {
    console.log('No Zapier webhook configured');
    return;
  }

  // Validate webhook URL
  try {
    new URL(webhookUrl);
  } catch {
    console.error('Invalid Zapier webhook URL');
    return;
  }

  const payload: ZapierPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Zapier webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error triggering Zapier webhook:', error);
    // Don't throw - webhook failures shouldn't break the app
  }
}

export const ZAPIER_EVENTS = {
  IDEA_CREATED: 'idea_created',
  IDEA_UPDATED: 'idea_updated',
  IDEA_STATUS_CHANGED: 'idea_status_changed',
  QUICK_NOTE_CREATED: 'quick_note_created',
  QUICK_NOTE_UPDATED: 'quick_note_updated',
  JOURNAL_ENTRY_CREATED: 'journal_entry_created',
  JOURNAL_ENTRY_UPDATED: 'journal_entry_updated',
} as const;
