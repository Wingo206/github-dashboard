import type { ReactNode } from "react";
import { cn } from "./cn";

const variantStyles = {
  error: {
    inline: "text-gh-red bg-gh-red/5",
    standalone: "text-gh-red bg-gh-red/10 border-gh-red/30",
  },
  warning: {
    inline: "text-gh-yellow bg-gh-yellow/5",
    standalone: "text-gh-yellow bg-gh-yellow/10 border-gh-yellow/30",
  },
  info: {
    inline: "text-gh-accent bg-gh-accent/5",
    standalone: "text-gh-accent bg-gh-accent/10 border-gh-accent/30",
  },
} as const;

interface StyledAlertBannerProps {
  variant?: "error" | "warning" | "info";
  inline?: boolean;
  children: ReactNode;
  className?: string;
}

export function StyledAlertBanner({
  variant = "error",
  inline = false,
  children,
  className,
}: StyledAlertBannerProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "text-sm",
        inline
          ? cn("px-4 py-3 border-b border-gh-border", style.inline)
          : cn("px-3 py-2 border rounded", style.standalone),
        className,
      )}
    >
      {children}
    </div>
  );
}
