interface RangeBarProps {
  low: number;
  high: number;
  progress: number;
}

export function RangeBar({ low, high, progress }: RangeBarProps) {
  return (
    <div className="flex w-full max-w-[180px] flex-col gap-1">
      <div className="relative h-1.5 w-full rounded-full bg-muted">
        <div
          className="absolute h-1.5 rounded-full bg-brand"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-violet-600 shadow-sm"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
