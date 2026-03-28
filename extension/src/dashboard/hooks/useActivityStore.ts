import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import type { RepoActivity } from "../../lib/types";
import type { ActivityStore, StoreState } from "../controllers";

export function useActivityStoreState(
  store: ActivityStore,
): StoreState<RepoActivity[]> {
  return useSignalValue(
    store.changed,
    useCallback(() => store.state, [store]),
  );
}
