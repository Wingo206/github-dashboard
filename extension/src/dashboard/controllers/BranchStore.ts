import { Signal } from "../../lib/signals";
import type { RecentBranch } from "../../lib/types";
import type { GitHubAPI } from "../../lib/github-api";
import type { StoreState } from "./types";

export class BranchStore {
  private _state: StoreState<RecentBranch[]> = { status: "loading" };

  readonly changed = new Signal<void>();

  get state(): StoreState<RecentBranch[]> {
    return this._state;
  }

  setLoading(): void {
    this._state = { status: "loading" };
    this.changed.emit();
  }

  setReady(data: RecentBranch[]): void {
    this._state = { status: "ready", data };
    this.changed.emit();
  }

  setError(error: string): void {
    this._state = { status: "error", error };
    this.changed.emit();
  }

  async refresh(
    api: GitHubAPI,
    owner: string,
    repo: string,
    username: string,
  ): Promise<void> {
    this.setLoading();
    try {
      const branches = await api.getRecentBranches(owner, repo, username);
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
