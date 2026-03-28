import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import type { DashboardSettings } from "../../lib/types";
import { useDashboard } from "../context/DashboardContext";

export function useSettings() {
  const { settings: manager } = useDashboard();

  const snapshot = useSignalValue(
    manager.changed,
    useCallback(
      () => ({
        settings: manager.current,
        loading: manager.loading,
        isConfigured: manager.isConfigured,
      }),
      [manager],
    ),
  );

  const update = useCallback(
    (partial: Partial<DashboardSettings>) => manager.update(partial),
    [manager],
  );

  return { ...snapshot, update };
}
