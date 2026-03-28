import type { ActivityStore } from "../controllers";
import type { ActivityType } from "../../lib/types";
import { useActivityStoreState } from "../hooks/useActivityStore";
import { useDashboard } from "../context/DashboardContext";
import { timeAgo } from "../utils/time";
import {
  StyledPanel,
  StyledPanelHeader,
  StyledAlertBanner,
  StyledEmptyState,
  StyledSpinner,
  StyledListRow,
  StyledBadge,
  TimeSincePicker,
} from "../ui";
import type { TimeSinceOption } from "../ui";
import {
  ArrowUpIcon,
  AlertIcon,
  GitBranchIcon,
  GitMergeIcon,
  TrashIcon,
} from "./Icons";

const ACTIVITY_TIME_OPTIONS: TimeSinceOption[] = [
  { label: "1d", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
];

const ACTIVITY_META: Record<
  ActivityType,
  { label: string; icon: typeof ArrowUpIcon; badgeClass: string }
> = {
  push: {
    label: "Push",
    icon: ArrowUpIcon,
    badgeClass: "text-gh-accent border-gh-accent/40 bg-gh-accent/10",
  },
  force_push: {
    label: "Force Push",
    icon: AlertIcon,
    badgeClass: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  },
  pr_merge: {
    label: "PR Merge",
    icon: GitMergeIcon,
    badgeClass: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  },
  branch_creation: {
    label: "Branch Created",
    icon: GitBranchIcon,
    badgeClass: "text-green-400 border-green-400/40 bg-green-400/10",
  },
  branch_deletion: {
    label: "Branch Deleted",
    icon: TrashIcon,
    badgeClass: "text-red-400 border-red-400/40 bg-red-400/10",
  },
  merge_queue_merge: {
    label: "Merge Queue",
    icon: GitMergeIcon,
    badgeClass: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  },
};

interface ActivityListProps {
  store: ActivityStore;
}

export default function ActivityList({ store }: ActivityListProps) {
  const state = useActivityStoreState(store);
  const controller = useDashboard();

  const loading = state.status === "loading";
  const error = state.status === "error" ? state.error : null;
  const activities = state.status === "ready" ? state.data : [];

  return (
    <StyledPanel>
      <StyledPanelHeader
        title="Recent Activity"
        trailing={
          <span className="flex items-center gap-3">
            <TimeSincePicker
              options={ACTIVITY_TIME_OPTIONS}
              value={store.days}
              onChange={(days) => controller.refreshActivity(days)}
            />
            <span className="min-w-[5.5rem] text-right">
              {loading
                ? "Loading..."
                : `${activities.length} event${activities.length !== 1 ? "s" : ""}`}
            </span>
          </span>
        }
      />

      {error && (
        <StyledAlertBanner variant="error" inline>
          {error}
        </StyledAlertBanner>
      )}

      {!loading && !error && activities.length === 0 && (
        <StyledEmptyState>No recent activity found.</StyledEmptyState>
      )}

      {loading && activities.length === 0 && (
        <StyledEmptyState>
          <StyledSpinner message="Fetching activity..." />
        </StyledEmptyState>
      )}

      {activities.map((activity) => {
        const meta = ACTIVITY_META[activity.activity_type];
        const IconComponent = meta.icon;
        const branchName = activity.ref.replace("refs/heads/", "");

        return (
          <StyledListRow key={activity.id} className="py-2">
            <IconComponent className="text-gh-muted shrink-0" />

            <StyledBadge className={meta.badgeClass}>
              {meta.label}
            </StyledBadge>

            <code className="text-sm font-medium text-gh-accent truncate min-w-0">
              {branchName}
            </code>

            <span className="text-xs text-gh-muted shrink-0 ml-auto">
              {timeAgo(activity.timestamp)}
            </span>
          </StyledListRow>
        );
      })}
    </StyledPanel>
  );
}
