import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import { useDashboard } from "../context/DashboardContext";

export function useCheckout() {
  const { checkout } = useDashboard();

  const branch = useSignalValue(
    checkout.changed,
    useCallback(() => checkout.branch, [checkout]),
  );

  const open = useCallback(
    (branchName: string) => checkout.open(branchName),
    [checkout],
  );

  const close = useCallback(() => checkout.close(), [checkout]);

  return { branch, open, close };
}
