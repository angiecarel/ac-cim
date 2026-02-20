import { QuickLinksManager } from '@/components/dashboard/QuickLinksManager';

export function QuickLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Quick Links</h1>
        <p className="text-muted-foreground mt-1">
          Manage your quick links and shortcuts
        </p>
      </div>

      <QuickLinksManager />
    </div>
  );
}
