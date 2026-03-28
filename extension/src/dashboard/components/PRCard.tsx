import type { EnrichedPR } from "../../lib/types";
import { timeAgo } from "../utils/time";
import { useCheckout } from "../hooks/useCheckout";
import { useSettings } from "../hooks/useSettings";
import { StyledListRow, StyledBadge, StyledAvatar, StyledAvatarStack } from "../ui";
import {
  CheckIcon,
  XIcon,
  TaskListIcon,
  TargetBranchIcon,
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

  return (
    <StyledListRow className="items-start">
      <div className="pt-0.5 shrink-0">
        <PRStatusIcon pr={pr} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gh-text hover:text-gh-accent transition-colors leading-tight"
          >
            {pr.title}
          </a>
          <CheckStatusIcon status={pr.checkStatus} />
          {pr.labels.map((label) => (
            <StyledBadge key={label.id} color={label.color} pill>
              {label.name}
            </StyledBadge>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-gh-muted flex-wrap">
          <span>
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
            <span className="text-gh-green flex items-center gap-0.5">
              <CheckIcon size={14} />
              {approvalCount} {approvalCount === 1 ? "approval" : "approvals"}
            </span>
          )}

          {pr.reviewDecision === "changes_requested" && (
            <span className="text-gh-red flex items-center gap-0.5">
              <XIcon size={14} />
              Changes requested
            </span>
          )}

          <span>updated {timeAgo(pr.updated_at)}</span>

          {pr.taskProgress && (
            <span className="flex items-center gap-1">
              <TaskListIcon size={14} className="text-gh-muted" />
              {pr.taskProgress.done}/{pr.taskProgress.total} tasks
            </span>
          )}

          <span className="inline-flex items-center gap-1 bg-gh-surface border border-gh-border rounded px-1.5 py-0.5">
            <TargetBranchIcon size={12} className="text-gh-muted" />
            To{" "}
            <span className="font-mono text-xs text-gh-accent">
              {pr.base.ref}
            </span>
          </span>
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
