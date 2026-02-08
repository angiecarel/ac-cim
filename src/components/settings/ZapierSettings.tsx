import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function ZapierSettings() {
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadWebhookUrl();
    }
  }, [user?.id]);

  const loadWebhookUrl = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('zapier_webhook_url')
        .eq('user_id', user.id)
        .single();

      if (data?.zapier_webhook_url) {
        setWebhookUrl(data.zapier_webhook_url);
        // Display masked URL for security
        setDisplayUrl(maskUrl(data.zapier_webhook_url));
      }
    } catch (error) {
      console.error('Error loading webhook URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maskUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/...`;
    } catch {
      return '••••••••••••••••••••';
    }
  };

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Webhook URL cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      toast({
        title: 'Error',
        description: 'Invalid webhook URL format',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ zapier_webhook_url: webhookUrl })
        .eq('user_id', user?.id);

      setDisplayUrl(maskUrl(webhookUrl));
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Zapier webhook URL saved',
      });
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to save webhook URL',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure? This will disconnect Zapier automations.')) return;

    setIsSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ zapier_webhook_url: null })
        .eq('user_id', user?.id);

      setWebhookUrl('');
      setDisplayUrl('');
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Zapier webhook disconnected',
      });
    } catch (error) {
      console.error('Error clearing webhook URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      toast({
        title: 'Copied',
        description: 'Webhook URL copied to clipboard',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          </svg>
          Zapier Integration
        </CardTitle>
        <CardDescription>Connect to Zapier to automate workflows with ClickUp and 6,000+ apps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">How it works:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Get your Zapier webhook URL from the Webhook app</li>
                <li>Paste it below</li>
                <li>Events from your app will automatically trigger your Zaps</li>
              </ol>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
              <Input
                id="webhook-url"
                type="password"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get this from Zapier's Webhook trigger
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <div className="mt-1.5 flex items-center gap-2 p-3 rounded-md bg-muted">
                {webhookUrl ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Connected</span>
                    <span className="text-xs text-muted-foreground ml-auto">{displayUrl}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                {webhookUrl ? 'Update' : 'Connect'}
              </Button>
              {webhookUrl && (
                <>
                  <Button onClick={copyToClipboard} variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleClear} variant="destructive" size="sm">
                    Disconnect
                  </Button>
                </>
              )}
              <a
                href="https://zapier.com/apps/webhook/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="ghost" size="sm">
                  Zapier Docs
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-semibold">Supported events:</Label>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Idea created, updated, or status changed</li>
            <li>• Quick note created or updated</li>
            <li>• Journal entry created or updated</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
