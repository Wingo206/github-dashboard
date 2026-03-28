import type { ReactNode, MouseEvent } from "react";
import { cn } from "./cn";

interface StyledModalProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export function StyledModal({ onClose, children, maxWidth = "max-w-lg", className }: StyledModalProps) {
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={cn("bg-gh-surface border border-gh-border rounded-lg w-full shadow-xl", maxWidth, className)}>
        {children}
      </div>
    </div>
  );
}
