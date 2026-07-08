import { useEffect, useState } from "react";
import { cn } from "../ui";
import { CheckIcon, GitBranchIcon, XIcon } from "./Icons";

interface BranchCopyBadgeProps {
  branchName: string;
}

const MAX_BRANCH_LABEL_LENGTH = 24;

export function BranchCopyBadge({ branchName }: BranchCopyBadgeProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (copyState === "idle") return;

    const timeout = window.setTimeout(() => setCopyState("idle"), 1500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(branchName);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const copied = copyState === "copied";
  const errored = copyState === "error";
  const label = copied ? "Copied" : errored ? "Copy failed" : truncateBranchName(branchName);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 bg-gh-surface border border-gh-border rounded px-1.5 py-0.5 shrink-0 transition-colors",
        "hover:border-gh-accent hover:text-gh-accent cursor-pointer",
        copied && "border-gh-green text-gh-green hover:text-gh-green",
        errored && "border-gh-red text-gh-red hover:text-gh-red",
      )}
      title={
        copied
          ? "Copied"
          : errored
            ? "Unable to copy branch"
            : `Click to copy ${branchName}`
      }
      aria-label={
        copied
          ? `Copied ${branchName}`
          : errored
            ? `Unable to copy ${branchName}`
            : `Click to copy ${branchName}`
      }
    >
      {copied ? (
        <CheckIcon size={12} className="shrink-0" />
      ) : errored ? (
        <XIcon size={12} className="shrink-0" />
      ) : (
        <GitBranchIcon size={12} className="text-gh-muted shrink-0" />
      )}
      <span className="font-mono text-xs">{label}</span>
    </button>
  );
}

function truncateBranchName(branchName: string) {
  if (branchName.length <= MAX_BRANCH_LABEL_LENGTH) {
    return branchName;
  }

  const visibleCharacters = MAX_BRANCH_LABEL_LENGTH - 3;
  const startLength = Math.ceil(visibleCharacters / 2);
  const endLength = Math.floor(visibleCharacters / 2);

  return `${branchName.slice(0, startLength)}...${branchName.slice(-endLength)}`;
}
