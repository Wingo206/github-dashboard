import { Signal } from "../../lib/signals";
import type { RecentBranch } from "../../lib/types";
import type { IGitHubAPI } from "../../lib/github-api";
import { initialStoreState, type StoreState } from "./types";

export class BranchStore {
  private _state: StoreState<RecentBranch[]> = initialStoreState();
  private _days: number = 7;

  readonly changed = new Signal<void>();

  get state(): StoreState<RecentBranch[]> {
    return this._state;
  }

  get days(): number {
    return this._days;
  }

  set days(value: number) {
    this._days = value;
    this.changed.emit();
  }

  reset(): void {
    this._state = { snapshot: { status: "none" }, loading: true };
    this.changed.emit();
  }

  setLoading(): void {
    this._state = { ...this._state, loading: true };
    this.changed.emit();
  }

  setReady(data: RecentBranch[]): void {
    this._state = { snapshot: { status: "ready", data }, loading: false };
    this.changed.emit();
  }

  setError(error: string): void {
    if (this._state.snapshot.status === "ready") {
      this._state = { ...this._state, loading: false };
    } else {
      this._state = { snapshot: { status: "error", error }, loading: false };
    }
    this.changed.emit();
  }

  async refresh(
    api: IGitHubAPI,
    owner: string,
    repo: string,
    username: string,
    options: { resetSnapshot?: boolean } = {},
  ): Promise<void> {
    if (options.resetSnapshot) {
      this.reset();
    }
    this.setLoading();
    try {
      const branches = await api.getRecentBranches(owner, repo, username, this._days);
      this.setReady(branches);
    } catch (err) {
      this.setError(
        err instanceof Error ? err.message : "Failed to fetch branches",
      );
    }
  }

  dispose(): void {
    this.changed.dispose();
  }
}
