import type { PRStore } from "../controllers";
import { usePRStoreState } from "../hooks/usePRStore";
import { StyledPanel, StyledPanelHeader, StyledAlertBanner, StyledEmptyState, StyledSpinner } from "../ui";
import PRCard from "./PRCard";

interface PRListProps {
  title: string;
  store: PRStore;
}

export default function PRList({ title, store }: PRListProps) {
  const state = usePRStoreState(store);

  const loading = state.status === "loading";
  const error = state.status === "error" ? state.error : null;
  const prs = state.status === "ready" ? state.data : [];

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
        <PRCard key={pr.id} pr={pr} />
      ))}
    </StyledPanel>
  );
}
