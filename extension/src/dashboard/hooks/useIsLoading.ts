import { useDashboard } from "../context/DashboardContext";
import { usePRStoreState } from "./usePRStore";
import { useBranchStoreState } from "./useBranchStore";
import { useActivityStoreState } from "./useActivityStore";

export function useIsLoading(): boolean {
  const { myPRs, branches, activity } = useDashboard();
  const prState = usePRStoreState(myPRs);
  const branchState = useBranchStoreState(branches);
  const activityState = useActivityStoreState(activity);
  return prState.status === "loading" || branchState.status === "loading" || activityState.status === "loading";
}
