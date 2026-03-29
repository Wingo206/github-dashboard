import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

interface StyledSmallButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function StyledSmallButton({
  active,
  className,
  disabled,
  children,
  ...props
}: StyledSmallButtonProps) {
  return (
    <button
      className={cn(
        "text-xs px-2 py-1 rounded border transition-colors",
        disabled
          ? "cursor-not-allowed text-gh-muted/40 border-gh-border/40"
          : active
            ? "bg-gh-accent/15 text-gh-accent border-gh-accent/40"
            : "text-gh-muted border-gh-border hover:text-gh-text hover:border-gh-text/40",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
