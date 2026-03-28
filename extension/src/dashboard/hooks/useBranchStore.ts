import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import type { RecentBranch } from "../../lib/types";
import type { BranchStore, StoreState } from "../controllers";

export function useBranchStoreState(
  store: BranchStore,
): StoreState<RecentBranch[]> {
  return useSignalValue(
    store.changed,
    useCallback(() => store.state, [store]),
  );
}
