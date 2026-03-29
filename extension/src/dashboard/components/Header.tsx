import { useDashboard } from "../context/DashboardContext";
import { useSettings } from "../hooks/useSettings";
import { useIsLoading } from "../hooks/useIsLoading";
import { useDebugMode } from "../hooks/useDebugMode";
import { StyledSmallButton } from "../ui";
import { GitHubLogoIcon, RefreshIcon, GearIcon } from "./Icons";

interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const controller = useDashboard();
  const { settings } = useSettings();
  const loading = useIsLoading();
  const debugMode = useDebugMode();

  const { repoOwner, repoName } = settings;

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
        <StyledSmallButton
          onClick={() => controller.setDebugMode(!debugMode)}
          active={debugMode}
          className={debugMode ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/40" : undefined}
          title="Toggle mock data for layout testing"
        >
          Mock
        </StyledSmallButton>

        <button
          onClick={() => controller.refresh()}
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
