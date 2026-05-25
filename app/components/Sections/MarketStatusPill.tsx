'use client';

import { useOpenOrClosed } from '@/app/hooks/useOpenOrClosed';
import { Skeleton } from '@/app/components/ui/skeleton';

export function MarketStatusPill() {
  const { loading, error, openOrClosed } = useOpenOrClosed();

  if (loading) {
    return <Skeleton className="h-8 w-28 rounded-full" />;
  }

  if (error) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
        Market status unavailable
      </span>
    );
  }

  const isOpen = openOrClosed === true;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
      <span
        className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}
      />
      {isOpen ? 'Market open' : 'Market closed'}
    </span>
  );
}
