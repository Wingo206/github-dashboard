import type { RecentBranch } from "../../lib/types";
import { timeAgo } from "../utils/time";
import { StyledPanel, StyledPanelHeader, StyledAlertBanner, StyledEmptyState, StyledSpinner, StyledListRow, StyledBadge } from "../ui";
import { GitBranchIcon } from "./Icons";

interface BranchListProps {
  branches: RecentBranch[];
  loading: boolean;
  error: string | null;
  onCheckout?: (branch: string) => void;
  showCheckout?: boolean;
}

export default function BranchList({
  branches,
  loading,
  error,
  onCheckout,
  showCheckout,
}: BranchListProps) {
  return (
    <StyledPanel>
      <StyledPanelHeader
        title="Recent Branches (last 7 days)"
        trailing={
          loading
            ? "Loading..."
            : `${branches.length} branch${branches.length !== 1 ? "es" : ""}`
        }
      />

      {error && (
        <StyledAlertBanner variant="error" inline>
          {error}
        </StyledAlertBanner>
      )}

      {!loading && !error && branches.length === 0 && (
        <StyledEmptyState>No recently pushed branches found.</StyledEmptyState>
      )}

      {loading && branches.length === 0 && (
        <StyledEmptyState>
          <StyledSpinner message="Fetching branches..." />
        </StyledEmptyState>
      )}

      {branches.map((branch) => (
        <StyledListRow key={branch.name}>
          <GitBranchIcon className="text-gh-muted shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium text-gh-accent truncate">
                {branch.name}
              </code>
              {branch.hasPR && (
                <StyledBadge className="bg-gh-purple/15 text-gh-purple border-gh-purple/30">
                  Has PR
                </StyledBadge>
              )}
            </div>
            <div className="text-xs text-gh-muted mt-0.5 truncate">
              <span>{branch.lastCommitMessage}</span>
              <span className="mx-1.5">&middot;</span>
              <span>{timeAgo(branch.lastCommitDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showCheckout && onCheckout && (
              <button
                onClick={() => onCheckout(branch.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs btn-secondary py-1 px-2"
                title={`Checkout ${branch.name}`}
              >
                Checkout
              </button>
            )}

            {!branch.hasPR && (
              <a
                href={branch.compareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs btn-primary py-1 px-2.5"
              >
                Create PR
              </a>
            )}
          </div>
        </StyledListRow>
      ))}
    </StyledPanel>
  );
}
