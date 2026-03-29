import { Signal } from "../../lib/signals";
import type { RepoActivity } from "../../lib/types";
import type { IGitHubAPI } from "../../lib/github-api";
import type { StoreState } from "./types";

export class ActivityStore {
  private _state: StoreState<RepoActivity[]> = { status: "loading" };
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

  setLoading(): void {
    this._state = { status: "loading" };
    this.changed.emit();
  }

  setReady(data: RepoActivity[]): void {
    this._state = { status: "ready", data };
    this.changed.emit();
  }

  setError(error: string): void {
    this._state = { status: "error", error };
    this.changed.emit();
  }

  async refresh(
    api: IGitHubAPI,
    owner: string,
    repo: string,
    username: string,
  ): Promise<void> {
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
