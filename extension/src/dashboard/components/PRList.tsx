import type { EnrichedPR } from "../../lib/types";
import PRCard from "./PRCard";
import { SpinnerIcon } from "./Icons";

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
    <div className="border border-gh-border rounded-md overflow-hidden">
      <div className="bg-gh-surface px-4 py-3 border-b border-gh-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gh-text">{title}</h3>
        <span className="text-xs text-gh-muted">
          {loading ? "Loading..." : `${prs.length} pull request${prs.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-gh-red bg-gh-red/5 border-b border-gh-border">
          {error}
        </div>
      )}

      {!loading && !error && prs.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gh-muted">
          No pull requests found.
        </div>
      )}

      {loading && prs.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gh-muted">
          <div className="flex items-center justify-center gap-2">
            <SpinnerIcon className="animate-spin h-4 w-4 text-gh-muted" />
            <span>Fetching pull requests...</span>
          </div>
        </div>
      )}

      {prs.map((pr) => (
        <PRCard
          key={pr.id}
          pr={pr}
          onCheckout={onCheckout}
          showCheckout={showCheckout}
        />
      ))}
    </div>
  );
}
