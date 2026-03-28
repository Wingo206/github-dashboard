import { useDashboard } from "../context/DashboardContext";
import { usePRStoreState } from "./usePRStore";
import { useBranchStoreState } from "./useBranchStore";

export function useIsLoading(): boolean {
  const { myPRs, branches } = useDashboard();
  const prState = usePRStoreState(myPRs);
  const branchState = useBranchStoreState(branches);
  return prState.status === "loading" || branchState.status === "loading";
}
