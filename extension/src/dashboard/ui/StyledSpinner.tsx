import { SpinnerIcon } from "../components/Icons";
import { cn } from "./cn";

interface StyledSpinnerProps {
  message?: string;
  className?: string;
}

export function StyledSpinner({ message, className }: StyledSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <SpinnerIcon className="animate-spin h-4 w-4 text-gh-muted" />
      {message && <span>{message}</span>}
    </div>
  );
}
