import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import { useDashboard } from "../context/DashboardContext";

export function useIsLoading(): boolean {
  const controller = useDashboard();
  return useSignalValue(
    controller.changed,
    useCallback(() => controller.loading, [controller]),
  );
}
