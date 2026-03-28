import { cn } from "./cn";

export interface TimeSinceOption<T extends string | number = number> {
  label: string;
  value: T;
}

interface TimeSincePickerProps<T extends string | number = number> {
  options: TimeSinceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function TimeSincePicker<T extends string | number = number>({
  options,
  value,
  onChange,
  className,
}: TimeSincePickerProps<T>) {
  return (
    <div className={cn("inline-flex rounded-md border border-gh-border overflow-hidden", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "text-xs px-2 py-0.5 font-medium transition-colors",
            "border-r border-gh-border last:border-r-0",
            opt.value === value
              ? "bg-gh-accent/15 text-gh-accent"
              : "bg-gh-surface text-gh-muted hover:text-gh-text hover:bg-gh-surface-hover",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
