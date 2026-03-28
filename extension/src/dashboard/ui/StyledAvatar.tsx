import type { ReactNode } from "react";
import { cn } from "./cn";

type AvatarSize = "sm" | "md";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

interface StyledAvatarProps {
  src: string;
  alt: string;
  title?: string;
  size?: AvatarSize;
  bordered?: boolean;
  className?: string;
}

export function StyledAvatar({ src, alt, title, size = "sm", bordered, className }: StyledAvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={cn(
        "rounded-full",
        sizeClasses[size],
        bordered && "border border-gh-bg",
        className,
      )}
    />
  );
}

interface StyledAvatarStackProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export function StyledAvatarStack({ children, className }: StyledAvatarStackProps) {
  return (
    <div className={cn("flex -space-x-1.5", className)}>
      {children}
    </div>
  );
}
