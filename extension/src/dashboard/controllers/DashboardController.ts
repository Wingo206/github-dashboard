import { SettingsManager } from "./SettingsManager";
import { PRStore } from "./PRStore";
import { BranchStore } from "./BranchStore";
import { ActivityStore } from "./ActivityStore";
import { CheckoutController } from "./CheckoutController";

export class DashboardController {
  readonly settings = new SettingsManager();
  readonly myPRs = new PRStore();
  readonly assignedPRs = new PRStore();
  readonly branches = new BranchStore();
  readonly activity = new ActivityStore();
  readonly checkout = new CheckoutController();

  get debugMode(): boolean {
    return this.settings.debugMode;
  }

  setDebugMode(enabled: boolean): void {
    this.settings.setDebugMode(enabled);
    this.refresh();
  }

  async init(): Promise<void> {
    await this.settings.init();
    if (this.settings.isConfigured) {
      this.refresh();
    }
  }

  async refresh(): Promise<void> {
    if (!this.settings.isConfigured) return;

    const api = this.settings.createApi();
    const { repoOwner, repoName } = this.settings.current;
    const resolvedUser = await this.settings.resolveUser(api);

    this.myPRs.setLoading();
    this.assignedPRs.setLoading();

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

    const branchPromise = this.branches.refresh(
      api,
      repoOwner,
      repoName,
      resolvedUser,
    );

    const activityPromise = this.activity.refresh(
      api,
      repoOwner,
      repoName,
      resolvedUser,
    );

    await Promise.all([prPromise, branchPromise, activityPromise]);
  }

  async refreshBranches(days: number): Promise<void> {
    if (!this.settings.isConfigured) return;

    this.branches.days = days;

    const api = this.settings.createApi();
    const { repoOwner, repoName } = this.settings.current;
    const resolvedUser = await this.settings.resolveUser(api);

    await this.branches.refresh(api, repoOwner, repoName, resolvedUser);
  }

  async refreshActivity(days: number): Promise<void> {
    if (!this.settings.isConfigured) return;

    this.activity.days = days;

    const api = this.settings.createApi();
    const { repoOwner, repoName } = this.settings.current;
    const resolvedUser = await this.settings.resolveUser(api);

    await this.activity.refresh(api, repoOwner, repoName, resolvedUser);
  }

  dispose(): void {
    this.settings.dispose();
    this.myPRs.dispose();
    this.assignedPRs.dispose();
    this.branches.dispose();
    this.activity.dispose();
    this.checkout.dispose();
  }
}
