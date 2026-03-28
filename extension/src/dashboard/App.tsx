import { useState, useEffect } from "react";
import Header from "./components/Header";
import PRList from "./components/PRList";
import BranchList from "./components/BranchList";
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
    <div className="min-h-screen bg-gh-bg">
      <Header
        onSettingsClick={() => setTab(tab === "settings" ? "dashboard" : "settings")}
      />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {tab === "settings" ? (
          <Settings
            onClose={() => {
              if (isConfigured) setTab("dashboard");
            }}
          />
        ) : (
          <div className="space-y-6">
            <PRList title="My Pull Requests" store={controller.myPRs} />
            <PRList title="Assigned to Me" store={controller.assignedPRs} />
            <BranchList store={controller.branches} />
          </div>
        )}
      </main>

      {checkoutBranch && <CheckoutModal />}
    </div>
  );
}
