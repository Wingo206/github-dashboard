import type { ReactNode } from "react";
import { cn } from "./cn";

interface StyledFormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function StyledFormField({ label, hint, children, className }: StyledFormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gh-text mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className={cn("text-xs text-gh-muted mt-1")}>{hint}</p>}
    </div>
  );
}
