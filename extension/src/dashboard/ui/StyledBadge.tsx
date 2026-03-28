import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn";

interface StyledBadgeProps {
  children: ReactNode;
  color?: string;
  pill?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function StyledBadge({ children, color, pill, className, style }: StyledBadgeProps) {
  const dynamicStyle: CSSProperties | undefined = color
    ? {
        color: `#${color}`,
        borderColor: `#${color}40`,
        backgroundColor: `#${color}18`,
        ...style,
      }
    : style;

  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 border font-medium",
        pill ? "rounded-full" : "rounded",
        className,
      )}
      style={dynamicStyle}
    >
      {children}
    </span>
  );
}
