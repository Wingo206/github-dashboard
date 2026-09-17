import type { BranchStore } from "../controllers";
import { useBranchStoreState } from "../hooks/useBranchStore";
import { useCheckout } from "../hooks/useCheckout";
import { useSettings } from "../hooks/useSettings";
import { useDashboard } from "../context/DashboardContext";
import { timeAgo } from "../utils/time";
import { StyledPanelHeader, StyledListRow, PaginatedList, ListSkeleton, ListError, ListEmpty, TimeSincePicker } from "../ui";
import type { TimeSinceOption } from "../ui";
import type { RecentBranch } from "../../lib/types";
import { BRANCH_ITEM_HEIGHT } from "../constants/listHeights";
import { GitBranchIcon } from "./Icons";

const BRANCH_TIME_OPTIONS: TimeSinceOption[] = [
  { label: "1d", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
];

interface BranchListProps {
  store: BranchStore;
}

export default function BranchList({ store }: BranchListProps) {
  const state = useBranchStoreState(store);
  const { open } = useCheckout();
  const { settings } = useSettings();
  const controller = useDashboard();
  const showCheckout = settings.repoPaths.length > 0;

  const { snapshot } = state;
  const branches = snapshot.status === "ready" ? snapshot.data : [];

  const header = (
    <StyledPanelHeader
      title="Branches Without PRs"
      trailing={
        <span className="flex items-center gap-3">
          <TimeSincePicker
            options={BRANCH_TIME_OPTIONS}
            value={store.days}
            onChange={(days) => controller.refreshBranches(days)}
          />
          <span className="min-w-[5.5rem] text-right">
            {snapshot.status !== "ready"
              ? "Loading..."
              : `${branches.length} branch${branches.length !== 1 ? "es" : ""}`}
          </span>
        </span>
      }
    />
  );

  if (snapshot.status === "none")
    return <ListSkeleton header={header} message="Fetching branches..." className="h-full" />;
  if (snapshot.status === "error")
    return <ListError header={header} error={snapshot.error} className="h-full" />;
  if (branches.length === 0)
    return <ListEmpty header={header} message="All recent branches have PRs." className="h-full" />;

  return (
    <PaginatedList
      header={header}
      items={branches}
      renderItem={(branch) => (
        <BranchRow branch={branch} showCheckout={showCheckout} onCheckout={open} />
      )}
      keyExtractor={(branch) => branch.name}
      itemHeight={BRANCH_ITEM_HEIGHT}
      className="h-full"
    />
  );
}

function BranchRow({
  branch,
  showCheckout,
  onCheckout,
}: {
  branch: RecentBranch;
  showCheckout: boolean;
  onCheckout: (name: string) => void;
}) {
  return (
    <StyledListRow style={{ height: BRANCH_ITEM_HEIGHT }}>
      <GitBranchIcon className="text-gh-muted shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-medium text-gh-accent truncate">
            {branch.name}
          </code>
        </div>
        <div className="text-xs text-gh-muted mt-0.5 truncate">
          <span>{branch.lastCommitMessage}</span>
          <span className="mx-1.5">&middot;</span>
          <span>{timeAgo(branch.lastCommitDate)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showCheckout && (
          <button
            onClick={() => onCheckout(branch.name)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs btn-secondary py-1 px-2"
            title={`Checkout ${branch.name}`}
          >
            Checkout
          </button>
        )}

        <a
          href={branch.compareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs btn-primary py-1 px-2.5"
        >
          Create PR
        </a>
      </div>
    </StyledListRow>
  );
}
