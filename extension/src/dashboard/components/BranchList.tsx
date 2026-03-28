import type { RecentBranch } from "../../lib/types";
import { timeAgo } from "../utils/time";
import { SpinnerIcon, GitBranchIcon } from "./Icons";

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
    <div className="border border-gh-border rounded-md overflow-hidden">
      <div className="bg-gh-surface px-4 py-3 border-b border-gh-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gh-text">
          Recent Branches (last 7 days)
        </h3>
        <span className="text-xs text-gh-muted">
          {loading
            ? "Loading..."
            : `${branches.length} branch${branches.length !== 1 ? "es" : ""}`}
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-gh-red bg-gh-red/5 border-b border-gh-border">
          {error}
        </div>
      )}

      {!loading && !error && branches.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gh-muted">
          No recently pushed branches found.
        </div>
      )}

      {loading && branches.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gh-muted">
          <div className="flex items-center justify-center gap-2">
            <SpinnerIcon className="animate-spin h-4 w-4 text-gh-muted" />
            <span>Fetching branches...</span>
          </div>
        </div>
      )}

      {branches.map((branch) => (
        <div
          key={branch.name}
          className="flex items-center gap-3 px-4 py-3 border-b border-gh-border last:border-b-0 hover:bg-gh-surface/60 transition-colors group"
        >
          <GitBranchIcon className="text-gh-muted shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium text-gh-accent truncate">
                {branch.name}
              </code>
              {branch.hasPR && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gh-purple/15 text-gh-purple border border-gh-purple/30">
                  Has PR
                </span>
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
        </div>
      ))}
    </div>
  );
}
