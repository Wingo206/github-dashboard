import type { ReactNode } from "react";
import { cn } from "./cn";

interface StyledListRowProps {
  children: ReactNode;
  className?: string;
}

export function StyledListRow({ children, className }: StyledListRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-gh-border last:border-b-0 hover:bg-gh-surface/60 transition-colors group",
        className,
      )}
    >
      {children}
    </div>
  );
}
