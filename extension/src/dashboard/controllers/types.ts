export type StoreState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };
