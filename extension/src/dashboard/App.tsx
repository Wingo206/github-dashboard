import { useState, useEffect } from "react";
import Header from "./components/Header";
import PRList from "./components/PRList";
import BranchList from "./components/BranchList";
import ActivityList from "./components/ActivityList";
import Settings from "./components/Settings";
import CheckoutModal from "./components/CheckoutModal";
import { useSettings } from "./hooks/useSettings";
import { useCheckout } from "./hooks/useCheckout";
import { useDashboard } from "./context/DashboardContext";

type Tab = "dashboard" | "settings";

export default function App() {
  const controller = useDashboard();
  const { loading: settingsLoading, isConfigured } = useSettings();
  const { branch: checkoutBranch } = useCheckout();

  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!settingsLoading && !isConfigured) {
      setTab("settings");
    }
  }, [settingsLoading, isConfigured]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gh-bg flex items-center justify-center text-gh-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gh-bg overflow-hidden">
      <Header
        onSettingsClick={() => setTab(tab === "settings" ? "dashboard" : "settings")}
      />

      {tab === "settings" ? (
        <main className="max-w-5xl mx-auto px-6 py-6">
          <Settings
            onClose={() => {
              if (isConfigured) setTab("dashboard");
            }}
          />
        </main>
      ) : (
        <main className="grid grid-cols-3 gap-6 px-6 py-6 h-[calc(100vh-49px)]">
          <div className="overflow-hidden">
            <PRList title="Assigned to Me" store={controller.assignedPRs} />
          </div>
          <div className="overflow-hidden">
            <PRList title="My Pull Requests" store={controller.myPRs} />
          </div>
          <div className="flex flex-col gap-6 h-full min-h-0">
            <div className="flex-1 min-h-0">
              <BranchList store={controller.branches} />
            </div>
            <div className="flex-1 min-h-0">
              <ActivityList store={controller.activity} />
            </div>
          </div>
        </main>
      )}

      {checkoutBranch && <CheckoutModal />}
    </div>
  );
}
