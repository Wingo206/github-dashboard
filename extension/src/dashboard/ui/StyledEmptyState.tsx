import type { ReactNode } from "react";
import { cn } from "./cn";

interface StyledEmptyStateProps {
  children: ReactNode;
  className?: string;
}

export function StyledEmptyState({ children, className }: StyledEmptyStateProps) {
  return (
    <div className={cn("px-4 py-8 text-center text-sm text-gh-muted", className)}>
      {children}
    </div>
  );
}
