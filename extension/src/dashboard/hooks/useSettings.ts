import { useState, useEffect, useCallback } from "react";
import { DashboardSettings, DEFAULT_SETTINGS } from "../../lib/types";
import { loadSettings, saveSettings } from "../../lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(
    async (partial: Partial<DashboardSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      await saveSettings(updated);
      return updated;
    },
    [settings]
  );

  const isConfigured =
    settings.githubToken.length > 0 &&
    settings.repoOwner.length > 0 &&
    settings.repoName.length > 0;

  return { settings, update, loading, isConfigured };
}
