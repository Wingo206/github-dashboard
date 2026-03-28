import type { EnrichedPR } from "../../lib/types";
import { StyledPanel, StyledPanelHeader, StyledAlertBanner, StyledEmptyState, StyledSpinner } from "../ui";
import PRCard from "./PRCard";

interface PRListProps {
  title: string;
  prs: EnrichedPR[];
  loading: boolean;
  error: string | null;
  onCheckout?: (branch: string) => void;
  showCheckout?: boolean;
}

export default function PRList({
  title,
  prs,
  loading,
  error,
  onCheckout,
  showCheckout,
}: PRListProps) {
  return (
    <StyledPanel>
      <StyledPanelHeader
        title={title}
        trailing={loading ? "Loading..." : `${prs.length} pull request${prs.length !== 1 ? "s" : ""}`}
      />

      {error && (
        <StyledAlertBanner variant="error" inline>
          {error}
        </StyledAlertBanner>
      )}

      {!loading && !error && prs.length === 0 && (
        <StyledEmptyState>No pull requests found.</StyledEmptyState>
      )}

      {loading && prs.length === 0 && (
        <StyledEmptyState>
          <StyledSpinner message="Fetching pull requests..." />
        </StyledEmptyState>
      )}

      {prs.map((pr) => (
        <PRCard
          key={pr.id}
          pr={pr}
          onCheckout={onCheckout}
          showCheckout={showCheckout}
        />
      ))}
    </StyledPanel>
  );
}
