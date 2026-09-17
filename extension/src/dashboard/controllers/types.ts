export type Snapshot<T> =
  | { status: "none" }
  | { status: "ready"; data: T }
  | { status: "error"; error: string };

export type StoreState<T> = {
  snapshot: Snapshot<T>;
  loading: boolean;
};

export function initialStoreState<T>(): StoreState<T> {
  return { snapshot: { status: "none" }, loading: false };
}

export function isBlankLoading(state: StoreState<unknown>): boolean {
  return state.loading && state.snapshot.status === "none";
}
