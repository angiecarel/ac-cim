import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fab text-primary-foreground"
      aria-label="Add new idea"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
