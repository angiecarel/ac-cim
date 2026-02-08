import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ZapierGuide() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Getting Started with Zapier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Step 1: Create a Zapier Zap</h4>
            <ol className="space-y-1 text-sm list-decimal list-inside text-muted-foreground">
              <li>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">zapier.com</a></li>
              <li>Create a new Zap</li>
              <li>Search for "Webhook" as your trigger</li>
              <li>Select "Catch Raw Body"</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 2: Copy Your Webhook URL</h4>
            <p className="text-sm text-muted-foreground">
              Zapier will give you a webhook URL. Copy it.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 3: Paste It Here</h4>
            <p className="text-sm text-muted-foreground">
              Go to Manage Settings and paste your webhook URL in the Zapier Integration section.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 4: Set Up Actions</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Back in Zapier, add actions to your Zap. For example:
            </p>
            <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
              <li>Create a ClickUp task when a Quick Note is created</li>
              <li>Send a message to Slack for journal entries</li>
              <li>Add events to Google Calendar</li>
              <li>Send an email digest of your notes</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 p-3">
          <p className="text-xs font-mono text-muted-foreground mb-2">
            Example webhook data structure:
          </p>
          <pre className="text-xs overflow-auto bg-muted p-2 rounded">
{`{
  "event": "quick_note_created",
  "timestamp": "2024-02-08T...",
  "data": {
    "id": "...",
    "title": "My note",
    "type": "quick_thought"
  }
}`}
          </pre>
        </div>

        <a
          href="https://zapier.com/apps/webhook/integrations"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full gap-2">
            Browse Zapier Integrations
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
