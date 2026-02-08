import { Plus } from 'lucide-react';

interface LogFABProps {
  onClick: () => void;
}

export function LogFAB({ onClick }: LogFABProps) {
  return (
    <button
      onClick={onClick}
      className="fab text-primary-foreground"
      aria-label="Quick capture"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
