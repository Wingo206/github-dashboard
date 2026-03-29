import type { ActivityStore } from "../controllers";
import type { ActivityType, RepoActivity } from "../../lib/types";
import { useActivityStoreState } from "../hooks/useActivityStore";
import { useDashboard } from "../context/DashboardContext";
import { timeAgo } from "../utils/time";
import {
  StyledPanelHeader,
  StyledListRow,
  StyledBadge,
  PaginatedList,
  ListSkeleton,
  ListError,
  ListEmpty,
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

const ACTIVITY_ITEM_HEIGHT = 44;

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
  const activities = state.status === "ready" ? state.data : [];

  const header = (
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
  );

  if (state.status === "loading")
    return <ListSkeleton header={header} message="Fetching activity..." className="h-full" />;
  if (state.status === "error")
    return <ListError header={header} error={state.error} className="h-full" />;
  if (activities.length === 0)
    return <ListEmpty header={header} message="No recent activity found." className="h-full" />;

  return (
    <PaginatedList
      header={header}
      items={activities}
      renderItem={(activity) => <ActivityRow activity={activity} />}
      keyExtractor={(activity) => activity.id}
      itemHeight={ACTIVITY_ITEM_HEIGHT}
      className="h-full"
    />
  );
}

function ActivityRow({ activity }: { activity: RepoActivity }) {
  const meta = ACTIVITY_META[activity.activity_type];
  const IconComponent = meta.icon;
  const branchName = activity.ref.replace("refs/heads/", "");

  return (
    <StyledListRow className="py-2">
      <IconComponent className="text-gh-muted shrink-0" />

      <StyledBadge className={meta.badgeClass}>{meta.label}</StyledBadge>

      <code className="text-sm font-medium text-gh-accent truncate min-w-0">
        {branchName}
      </code>

      <span className="text-xs text-gh-muted shrink-0 ml-auto">
        {timeAgo(activity.timestamp)}
      </span>
    </StyledListRow>
  );
}
