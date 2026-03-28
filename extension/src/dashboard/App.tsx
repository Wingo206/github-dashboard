import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import PRList from "./components/PRList";
import BranchList from "./components/BranchList";
import Settings from "./components/Settings";
import CheckoutModal from "./components/CheckoutModal";
import { useSettings } from "./hooks/useSettings";
import { createGitHubAPI } from "../lib/github-api";
import type { EnrichedPR, RecentBranch } from "../lib/types";

type Tab = "dashboard" | "settings";

export default function App() {
  const { settings, update, loading: settingsLoading, isConfigured } = useSettings();
  const [tab, setTab] = useState<Tab>("dashboard");

  const [myPRs, setMyPRs] = useState<EnrichedPR[]>([]);
  const [assignedPRs, setAssignedPRs] = useState<EnrichedPR[]>([]);
  const [recentBranches, setRecentBranches] = useState<RecentBranch[]>([]);

  const [prLoading, setPrLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);

  const [checkoutBranch, setCheckoutBranch] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isConfigured) return;

    const api = createGitHubAPI(settings.githubToken);
    const { repoOwner, repoName, username } = settings;

    setPrLoading(true);
    setPrError(null);
    setBranchLoading(true);
    setBranchError(null);

    try {
      const prs = await api.getPullRequests(repoOwner, repoName);
      const enriched = await api.enrichPRs(repoOwner, repoName, prs);

      const user = username || (await api.getCurrentUser()).login;
      setMyPRs(
        enriched.filter(
          (pr) => pr.user.login.toLowerCase() === user.toLowerCase()
        )
      );
      setAssignedPRs(
        enriched.filter((pr) =>
          pr.assignees.some(
            (a) => a.login.toLowerCase() === user.toLowerCase()
          )
        )
      );
    } catch (err) {
      setPrError(
        err instanceof Error ? err.message : "Failed to fetch pull requests"
      );
    } finally {
      setPrLoading(false);
    }

    try {
      const user =
        settings.username ||
        (await createGitHubAPI(settings.githubToken).getCurrentUser()).login;
      const branches = await api.getRecentBranches(
        repoOwner,
        repoName,
        user
      );
      setRecentBranches(branches);
    } catch (err) {
      setBranchError(
        err instanceof Error ? err.message : "Failed to fetch branches"
      );
    } finally {
      setBranchLoading(false);
    }
  }, [isConfigured, settings]);

  useEffect(() => {
    if (!settingsLoading && isConfigured) {
      fetchData();
    }
  }, [settingsLoading, isConfigured, fetchData]);

  useEffect(() => {
    if (!settingsLoading && !isConfigured) {
      setTab("settings");
    }
  }, [settingsLoading, isConfigured]);

  const showCheckout = settings.repoPaths.length > 0;

  const handleCheckout = (branch: string) => {
    setCheckoutBranch(branch);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gh-bg flex items-center justify-center text-gh-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gh-bg">
      <Header
        repoOwner={settings.repoOwner}
        repoName={settings.repoName}
        onSettingsClick={() => setTab(tab === "settings" ? "dashboard" : "settings")}
        onRefresh={fetchData}
        loading={prLoading || branchLoading}
      />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {tab === "settings" ? (
          <Settings
            settings={settings}
            onSave={async (partial) => {
              const updated = await update(partial);
              return updated;
            }}
            onClose={() => {
              if (isConfigured) setTab("dashboard");
            }}
          />
        ) : (
          <div className="space-y-6">
            <PRList
              title="My Pull Requests"
              prs={myPRs}
              loading={prLoading}
              error={prError}
              onCheckout={handleCheckout}
              showCheckout={showCheckout}
            />

            <PRList
              title="Assigned to Me"
              prs={assignedPRs}
              loading={prLoading}
              error={null}
              onCheckout={handleCheckout}
              showCheckout={showCheckout}
            />

            <BranchList
              branches={recentBranches}
              loading={branchLoading}
              error={branchError}
              onCheckout={handleCheckout}
              showCheckout={showCheckout}
            />
          </div>
        )}
      </main>

      {checkoutBranch && (
        <CheckoutModal
          branch={checkoutBranch}
          serverUrl={settings.localServerUrl}
          repoPaths={settings.repoPaths}
          onClose={() => setCheckoutBranch(null)}
        />
      )}
    </div>
  );
}
