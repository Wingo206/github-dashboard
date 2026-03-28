import { GitHubLogoIcon, RefreshIcon, GearIcon } from "./Icons";

interface HeaderProps {
  repoOwner: string;
  repoName: string;
  onSettingsClick: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({
  repoOwner,
  repoName,
  onSettingsClick,
  onRefresh,
  loading,
}: HeaderProps) {
  return (
    <header className="border-b border-gh-border bg-gh-surface px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <GitHubLogoIcon size={24} className="text-gh-text" />

        {repoOwner && repoName ? (
          <div className="flex items-center gap-1.5">
            <a
              href={`https://github.com/${repoOwner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gh-accent hover:underline text-sm"
            >
              {repoOwner}
            </a>
            <span className="text-gh-muted">/</span>
            <a
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gh-accent hover:underline text-sm font-semibold"
            >
              {repoName}
            </a>
          </div>
        ) : (
          <span className="text-gh-muted text-sm">GitHub Dashboard</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-icon"
          title="Refresh"
        >
          <RefreshIcon className={loading ? "animate-spin" : ""} />
        </button>

        <button
          onClick={onSettingsClick}
          className="btn-icon"
          title="Settings"
        >
          <GearIcon />
        </button>
      </div>
    </header>
  );
}
