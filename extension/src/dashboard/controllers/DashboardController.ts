import { Signal } from "../../lib/signals";
import { SettingsManager } from "./SettingsManager";
import { PRStore } from "./PRStore";
import { BranchStore } from "./BranchStore";
import { ActivityStore } from "./ActivityStore";
import { CheckoutController } from "./CheckoutController";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export class DashboardController {
  readonly settings = new SettingsManager();
  readonly myPRs = new PRStore();
  readonly assignedPRs = new PRStore();
  readonly branches = new BranchStore();
  readonly activity = new ActivityStore();
  readonly checkout = new CheckoutController();
  readonly changed = new Signal<void>();

  private _loading = false;
  private _lastRefreshedAt = 0;
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly _onVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      this.refreshIfStale();
      this.armInterval();
    } else {
      this.clearInterval();
    }
  };

  get debugMode(): boolean {
    return this.settings.debugMode;
  }

  get loading(): boolean {
    return this._loading;
  }

  setDebugMode(enabled: boolean): void {
    this.settings.setDebugMode(enabled);
    this.refresh({ reset: true });
  }

  async init(): Promise<void> {
    await this.settings.init();
    document.addEventListener("visibilitychange", this._onVisibilityChange);
    if (this.settings.isConfigured) {
      await this.refresh();
    }
    if (document.visibilityState === "visible") {
      this.armInterval();
    }
  }

  async refresh(options: { reset?: boolean } = {}): Promise<void> {
    if (!this.settings.isConfigured) return;
    if (this._loading) return;

    if (options.reset) {
      this.myPRs.reset();
      this.assignedPRs.reset();
      this.branches.reset();
      this.activity.reset();
    }

    this._loading = true;
    this.changed.emit();
    this.myPRs.setLoading();
    this.assignedPRs.setLoading();
    this.branches.setLoading();
    this.activity.setLoading();

    try {
      const api = this.settings.createApi();
      const { repoOwner, repoName } = this.settings.current;
      const resolvedUser = await this.settings.resolveUser(api);

      const prPromise = (async () => {
        try {
          const enriched = await api.getEnrichedPullRequests(repoOwner, repoName);

          this.myPRs.setReady(
            enriched.filter(
              (pr) => pr.user.login.toLowerCase() === resolvedUser.toLowerCase(),
            ),
          );
          this.assignedPRs.setReady(
            enriched.filter((pr) =>
              pr.assignees.some(
                (a) => a.login.toLowerCase() === resolvedUser.toLowerCase(),
              ),
            ),
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch pull requests";
          this.myPRs.setError(message);
          this.assignedPRs.setError(message);
        }
      })();

      await Promise.all([
        prPromise,
        this.branches.refresh(api, repoOwner, repoName, resolvedUser),
        this.activity.refresh(api, repoOwner, repoName, resolvedUser),
      ]);

      this._lastRefreshedAt = Date.now();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh dashboard";
      this.myPRs.setError(message);
      this.assignedPRs.setError(message);
      this.branches.setError(message);
      this.activity.setError(message);
    } finally {
      this._loading = false;
      this.changed.emit();
    }
  }

  async refreshBranches(days: number): Promise<void> {
    if (!this.settings.isConfigured) return;

    this.branches.days = days;

    const api = this.settings.createApi();
    const { repoOwner, repoName } = this.settings.current;
    const resolvedUser = await this.settings.resolveUser(api);

    await this.branches.refresh(api, repoOwner, repoName, resolvedUser, {
      resetSnapshot: true,
    });
  }

  async refreshActivity(days: number): Promise<void> {
    if (!this.settings.isConfigured) return;

    this.activity.days = days;

    const api = this.settings.createApi();
    const { repoOwner, repoName } = this.settings.current;
    const resolvedUser = await this.settings.resolveUser(api);

    await this.activity.refresh(api, repoOwner, repoName, resolvedUser, {
      resetSnapshot: true,
    });
  }

  dispose(): void {
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this.clearInterval();
    this.settings.dispose();
    this.myPRs.dispose();
    this.assignedPRs.dispose();
    this.branches.dispose();
    this.activity.dispose();
    this.checkout.dispose();
    this.changed.dispose();
  }

  private refreshIfStale(): void {
    if (
      this._lastRefreshedAt === 0 ||
      Date.now() - this._lastRefreshedAt >= REFRESH_INTERVAL_MS
    ) {
      this.refresh();
    }
  }

  private armInterval(): void {
    this.clearInterval();
    this._intervalId = setInterval(() => {
      this.refresh();
    }, REFRESH_INTERVAL_MS);
  }

  private clearInterval(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}
