import type { ReactNode } from "react";
import { StyledPanel } from "./StyledPanel";
import { StyledSpinner } from "./StyledSpinner";
import { StyledAlertBanner } from "./StyledAlertBanner";
import { StyledEmptyState } from "./StyledEmptyState";

interface ListSkeletonProps {
  header: ReactNode;
  message?: string;
  className?: string;
}

export function ListSkeleton({ header, message, className }: ListSkeletonProps) {
  return (
    <StyledPanel className={className}>
      {header}
      <StyledEmptyState>
        <StyledSpinner message={message} />
      </StyledEmptyState>
    </StyledPanel>
  );
}

interface ListErrorProps {
  header: ReactNode;
  error: string;
  className?: string;
}

export function ListError({ header, error, className }: ListErrorProps) {
  return (
    <StyledPanel className={className}>
      {header}
      <StyledAlertBanner variant="error" inline>
        {error}
      </StyledAlertBanner>
    </StyledPanel>
  );
}

interface ListEmptyProps {
  header: ReactNode;
  message: string;
  className?: string;
}

export function ListEmpty({ header, message, className }: ListEmptyProps) {
  return (
    <StyledPanel className={className}>
      {header}
      <StyledEmptyState>{message}</StyledEmptyState>
    </StyledPanel>
  );
}
