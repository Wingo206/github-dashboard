import { useState, useEffect } from "react";
import type { LocalRepoInfo } from "../../lib/types";
import { useCheckout } from "../hooks/useCheckout";
import { useSettings } from "../hooks/useSettings";
import { StyledModal, StyledPanelHeader, StyledAlertBanner, StyledEmptyState } from "../ui";
import { XIcon, CheckIcon } from "./Icons";

export default function CheckoutModal() {
  const { branch, close } = useCheckout();
  const { settings } = useSettings();
  const { localServerUrl: serverUrl, repoPaths } = settings;

  const [repos, setRepos] = useState<LocalRepoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<
    Record<string, "idle" | "loading" | "success" | "error">
  >({});
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${serverUrl}/repos`);
      if (!res.ok) throw new Error("Server not reachable");
      const data = await res.json();
      setRepos(data.repos);
    } catch {
      if (repoPaths.length > 0) {
        setRepos(
          repoPaths.map((p) => ({
            path: p,
            currentBranch: "unknown",
            hasChanges: false,
          }))
        );
      }
      setError(
        "Could not connect to local server. Make sure the companion server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (repoPath: string) => {
    setCheckoutStatus((s) => ({ ...s, [repoPath]: "loading" }));
    setCheckoutErrors((e) => ({ ...e, [repoPath]: "" }));

    try {
      const res = await fetch(`${serverUrl}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoPath, branch }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setCheckoutStatus((s) => ({ ...s, [repoPath]: "success" }));
      fetchRepos();
    } catch (err) {
      setCheckoutStatus((s) => ({ ...s, [repoPath]: "error" }));
      setCheckoutErrors((e) => ({
        ...e,
        [repoPath]: err instanceof Error ? err.message : "Checkout failed",
      }));
    }
  };

  return (
    <StyledModal onClose={close}>
      <StyledPanelHeader
        title={
          <div>
            <span>Checkout Branch</span>
            <code className="block text-xs text-gh-accent font-normal mt-0.5">{branch}</code>
          </div>
        }
        trailing={
          <button
            onClick={close}
            className="text-gh-muted hover:text-gh-text transition-colors"
          >
            <XIcon size={20} />
          </button>
        }
      />

      <div className="p-4">
        {error && (
          <StyledAlertBanner variant="warning" className="mb-3">
            {error}
          </StyledAlertBanner>
        )}

        {loading ? (
          <StyledEmptyState className="py-4 px-0">
            Fetching repository info...
          </StyledEmptyState>
        ) : repos.length === 0 ? (
          <StyledEmptyState className="py-4 px-0">
            No repositories configured. Add paths in Settings.
          </StyledEmptyState>
        ) : (
          <div className="space-y-2">
            {repos.map((repo) => {
              const status = checkoutStatus[repo.path] || "idle";
              return (
                <div
                  key={repo.path}
                  className="flex items-center gap-3 border border-gh-border rounded px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <code className="text-sm text-gh-text block truncate">
                      {repo.path}
                    </code>
                    <span className="text-xs text-gh-muted">
                      Current: {repo.currentBranch}
                      {repo.hasChanges && (
                        <span className="text-gh-yellow ml-1">
                          (has uncommitted changes)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {status === "success" ? (
                      <span className="text-xs text-gh-green flex items-center gap-1">
                        <CheckIcon size={14} />
                        Done
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckout(repo.path)}
                        disabled={status === "loading"}
                        className="text-xs btn-secondary py-1 px-2"
                      >
                        {status === "loading"
                          ? "Checking out..."
                          : "Checkout here"}
                      </button>
                    )}
                  </div>
                  {checkoutErrors[repo.path] && (
                    <div className="text-xs text-gh-red mt-1 w-full">
                      {checkoutErrors[repo.path]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StyledModal>
  );
}
