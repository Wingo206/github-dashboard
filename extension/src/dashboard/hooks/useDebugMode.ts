import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import { useDashboard } from "../context/DashboardContext";

export function useDebugMode(): boolean {
  const { settings } = useDashboard();
  return useSignalValue(
    settings.changed,
    useCallback(() => settings.debugMode, [settings]),
  );
}
