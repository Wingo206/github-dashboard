import { useCallback } from "react";
import { useSignalValue } from "../../lib/signals";
import type { EnrichedPR } from "../../lib/types";
import type { PRStore, StoreState } from "../controllers";

export function usePRStoreState(store: PRStore): StoreState<EnrichedPR[]> {
  return useSignalValue(
    store.changed,
    useCallback(() => store.state, [store]),
  );
}
