import { Signal } from "../../lib/signals";
import type { RepoActivity } from "../../lib/types";
import type { IGitHubAPI } from "../../lib/github-api";
import { initialStoreState, type StoreState } from "./types";

export class ActivityStore {
  private _state: StoreState<RepoActivity[]> = initialStoreState();
  private _days: number = 7;

  readonly changed = new Signal<void>();

  get state(): StoreState<RepoActivity[]> {
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

  setReady(data: RepoActivity[]): void {
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
      const activities = await api.getRepoActivity(owner, repo, username, this._days);
      this.setReady(activities);
    } catch (err) {
      this.setError(
        err instanceof Error ? err.message : "Failed to fetch activity",
      );
    }
  }

  dispose(): void {
    this.changed.dispose();
  }
}
