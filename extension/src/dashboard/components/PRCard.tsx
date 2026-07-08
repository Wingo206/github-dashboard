import type { EnrichedPR } from "../../lib/types";
import { timeAgo } from "../utils/time";
import { useCheckout } from "../hooks/useCheckout";
import { useSettings } from "../hooks/useSettings";
import { StyledListRow, StyledBadge, StyledAvatar, StyledAvatarStack } from "../ui";
import { PR_ITEM_HEIGHT } from "../constants/listHeights";
import { BranchCopyBadge } from "./BranchCopyBadge";
import {
  CheckIcon,
  XIcon,
  TaskListIcon,
  CheckoutIcon,
  CommentIcon,
  GitMergeIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  DotIcon,
} from "./Icons";

interface PRCardProps {
  pr: EnrichedPR;
}

export default function PRCard({ pr }: PRCardProps) {
  const { open } = useCheckout();
  const { settings } = useSettings();
  const showCheckout = settings.repoPaths.length > 0;

  const approvalCount = pr.reviews.filter(
    (r) => r.state === "APPROVED"
  ).length;

  const visibleLabels = pr.labels.slice(0, 2);
  const hiddenLabelCount = pr.labels.length - visibleLabels.length;

  const metadataParts = [
    `#${pr.number} by ${pr.user.login}`,
    approvalCount > 0 ? `${approvalCount} approval${approvalCount !== 1 ? "s" : ""}` : null,
    pr.reviewDecision === "changes_requested" ? "Changes requested" : null,
    `updated ${timeAgo(pr.updated_at)}`,
    pr.taskProgress ? `${pr.taskProgress.done}/${pr.taskProgress.total} tasks` : null,
    `branch ${pr.head.ref}`,
  ].filter(Boolean).join(" · ");

  return (
    <StyledListRow className="items-start" style={{ height: PR_ITEM_HEIGHT }}>
      <div className="pt-0.5 shrink-0">
        <PRStatusIcon pr={pr} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gh-text hover:text-gh-accent transition-colors leading-tight truncate shrink"
            title={pr.title}
          >
            {pr.title}
          </a>
          <CheckStatusIcon status={pr.checkStatus} />
          {visibleLabels.map((label) => (
            <StyledBadge key={label.id} color={label.color} pill className="shrink-0">
              {label.name}
            </StyledBadge>
          ))}
          {hiddenLabelCount > 0 && (
            <span
              className="text-xs text-gh-muted shrink-0"
              title={pr.labels.slice(2).map((l) => l.name).join(", ")}
            >
              +{hiddenLabelCount}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-3 mt-1 text-xs text-gh-muted overflow-hidden whitespace-nowrap"
          title={metadataParts}
        >
          <span className="shrink-0">
            #{pr.number} opened {timeAgo(pr.created_at)} by{" "}
            <StyledAvatar
              src={pr.user.avatar_url}
              alt={pr.user.login}
              size="sm"
              className="inline-block align-text-bottom"
            />{" "}
            <span className="font-medium">{pr.user.login}</span>
          </span>

          {approvalCount > 0 && (
            <span className="text-gh-green flex items-center gap-0.5 shrink-0">
              <CheckIcon size={14} />
              {approvalCount} {approvalCount === 1 ? "approval" : "approvals"}
            </span>
          )}

          {pr.reviewDecision === "changes_requested" && (
            <span className="text-gh-red flex items-center gap-0.5 shrink-0">
              <XIcon size={14} />
              Changes requested
            </span>
          )}

          <span className="shrink-0">updated {timeAgo(pr.updated_at)}</span>

          {pr.taskProgress && (
            <span className="flex items-center gap-1 shrink-0">
              <TaskListIcon size={14} className="text-gh-muted" />
              {pr.taskProgress.done}/{pr.taskProgress.total}
            </span>
          )}

          <BranchCopyBadge branchName={pr.head.ref} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-center">
        {showCheckout && (
          <button
            onClick={() => open(pr.head.ref)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs btn-secondary py-1 px-2"
            title={`Checkout ${pr.head.ref}`}
          >
            <CheckoutIcon size={14} className="inline mr-1" />
            Checkout
          </button>
        )}

        {pr.assignees.length > 0 && (
          <StyledAvatarStack>
            {pr.assignees.slice(0, 3).map((a) => (
              <StyledAvatar
                key={a.login}
                src={a.avatar_url}
                alt={a.login}
                title={a.login}
                size="md"
                bordered
              />
            ))}
          </StyledAvatarStack>
        )}

        {pr.comments > 0 && (
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gh-muted hover:text-gh-accent transition-colors"
          >
            <CommentIcon size={14} />
            {pr.comments}
          </a>
        )}
      </div>
    </StyledListRow>
  );
}

function PRStatusIcon({ pr }: { pr: EnrichedPR }) {
  if (pr.merged_at) {
    return <GitMergeIcon className="text-gh-purple" />;
  }
  if (pr.draft) {
    return <GitPullRequestDraftIcon className="text-gh-muted" />;
  }
  if (pr.state === "closed") {
    return <GitPullRequestDraftIcon className="text-gh-red" />;
  }
  return <GitPullRequestIcon className="text-gh-green" />;
}

function CheckStatusIcon({
  status,
}: {
  status: EnrichedPR["checkStatus"];
}) {
  switch (status) {
    case "success":
      return <CheckIcon size={14} className="text-gh-green" />;
    case "failure":
      return <XIcon size={14} className="text-gh-red" />;
    case "pending":
      return <DotIcon size={14} className="text-gh-yellow" />;
    default:
      return null;
  }
}
