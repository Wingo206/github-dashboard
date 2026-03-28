import { createGitHubAPI } from "../../lib/github-api";
import { SettingsManager } from "./SettingsManager";
import { PRStore } from "./PRStore";
import { BranchStore } from "./BranchStore";
import { CheckoutController } from "./CheckoutController";

export class DashboardController {
  readonly settings = new SettingsManager();
  readonly myPRs = new PRStore();
  readonly assignedPRs = new PRStore();
  readonly branches = new BranchStore();
  readonly checkout = new CheckoutController();

  async init(): Promise<void> {
    await this.settings.init();
    if (this.settings.isConfigured) {
      this.refresh();
    }
  }

  async refresh(): Promise<void> {
    if (!this.settings.isConfigured) return;

    const { githubToken, repoOwner, repoName, username } =
      this.settings.current;
    const api = createGitHubAPI(githubToken);

    this.myPRs.setLoading();
    this.assignedPRs.setLoading();

    const resolvedUser =
      username || (await api.getCurrentUser()).login;

    const prPromise = (async () => {
      try {
        const prs = await api.getPullRequests(repoOwner, repoName);
        const enriched = await api.enrichPRs(repoOwner, repoName, prs);

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

    await Promise.all([prPromise, branchPromise]);
  }

  dispose(): void {
    this.settings.dispose();
    this.myPRs.dispose();
    this.assignedPRs.dispose();
    this.branches.dispose();
    this.checkout.dispose();
  }
}
