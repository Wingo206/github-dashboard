import type { ReactNode } from "react";
import { cn } from "./cn";

interface StyledPanelProps {
  children: ReactNode;
  className?: string;
}

export function StyledPanel({ children, className }: StyledPanelProps) {
  return (
    <div className={cn("border border-gh-border rounded-md overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface StyledPanelHeaderProps {
  title: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export function StyledPanelHeader({ title, trailing, className }: StyledPanelHeaderProps) {
  return (
    <div className={cn("bg-gh-surface px-4 py-3 border-b border-gh-border flex items-center justify-between", className)}>
      <h3 className="text-sm font-semibold text-gh-text">{title}</h3>
      {trailing && <span className="text-xs text-gh-muted">{trailing}</span>}
    </div>
  );
}
