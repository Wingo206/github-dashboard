import type {
  GitHubPullRequest,
  GitHubUser,
  CheckRunsResponse,
  Review,
  GitHubBranch,
  GitHubCommit,
  EnrichedPR,
  RecentBranch,
} from "./types";

class GitHubAPI {
  private token: string;
  private baseUrl = "https://api.github.com";

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("/user");
  }

  async getPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<GitHubPullRequest[]> {
    const prs: GitHubPullRequest[] = [];
    let page = 1;
    while (true) {
      const batch = await this.request<GitHubPullRequest[]>(
        `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100&page=${page}&sort=updated&direction=desc`
      );
      prs.push(...batch);
      if (batch.length < 100) break;
      page++;
    }
    return prs;
  }

  async getCheckRuns(
    owner: string,
    repo: string,
    ref: string
  ): Promise<CheckRunsResponse> {
    return this.request<CheckRunsResponse>(
      `/repos/${owner}/${repo}/commits/${ref}/check-runs`
    );
  }

  async getReviews(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<Review[]> {
    return this.request<Review[]>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`
    );
  }

  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const branches: GitHubBranch[] = [];
    let page = 1;
    while (true) {
      const batch = await this.request<GitHubBranch[]>(
        `/repos/${owner}/${repo}/branches?per_page=100&page=${page}`
      );
      branches.push(...batch);
      if (batch.length < 100) break;
      page++;
    }
    return branches;
  }

  async getRecentCommits(
    owner: string,
    repo: string,
    author: string,
    since: string
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    let page = 1;
    while (true) {
      const batch = await this.request<GitHubCommit[]>(
        `/repos/${owner}/${repo}/commits?author=${author}&since=${since}&per_page=100&page=${page}`
      );
      commits.push(...batch);
      if (batch.length < 100) break;
      page++;
    }
    return commits;
  }

  async enrichPR(
    owner: string,
    repo: string,
    pr: GitHubPullRequest
  ): Promise<EnrichedPR> {
    const [checkRunsResp, reviews] = await Promise.all([
      this.getCheckRuns(owner, repo, pr.head.sha).catch(() => ({
        total_count: 0,
        check_runs: [],
      })),
      this.getReviews(owner, repo, pr.number).catch(() => []),
    ]);

    const checkStatus = deriveCheckStatus(checkRunsResp);
    const reviewDecision = deriveReviewDecision(reviews);
    const taskProgress = parseTaskProgress(pr.body);

    return {
      ...pr,
      checkStatus,
      reviews,
      reviewDecision,
      taskProgress,
    };
  }

  async enrichPRs(
    owner: string,
    repo: string,
    prs: GitHubPullRequest[]
  ): Promise<EnrichedPR[]> {
    return Promise.all(prs.map((pr) => this.enrichPR(owner, repo, pr)));
  }

  async getRecentBranches(
    owner: string,
    repo: string,
    username: string,
    days: number = 7
  ): Promise<RecentBranch[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [branches, commits, openPRs] = await Promise.all([
      this.getBranches(owner, repo),
      this.getRecentCommits(
        owner,
        repo,
        username,
        since.toISOString()
      ),
      this.getPullRequests(owner, repo, "open"),
    ]);

    const recentCommitShas = new Set(commits.map((c) => c.sha));
    const commitBySha = new Map(commits.map((c) => [c.sha, c]));
    const prBranches = new Set(openPRs.map((pr) => pr.head.ref));

    return branches
      .filter((b) => recentCommitShas.has(b.commit.sha))
      .map((b) => {
        const commit = commitBySha.get(b.commit.sha)!;
        return {
          name: b.name,
          lastCommitDate: commit.commit.author.date,
          lastCommitMessage: commit.commit.message.split("\n")[0],
          lastCommitSha: commit.sha,
          compareUrl: `https://github.com/${owner}/${repo}/compare/${b.name}?expand=1`,
          hasPR: prBranches.has(b.name),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastCommitDate).getTime() -
          new Date(a.lastCommitDate).getTime()
      );
  }
}

function deriveCheckStatus(
  resp: CheckRunsResponse
): EnrichedPR["checkStatus"] {
  if (resp.total_count === 0) return "none";
  const runs = resp.check_runs;
  if (runs.some((r) => r.conclusion === "failure")) return "failure";
  if (runs.some((r) => r.status !== "completed")) return "pending";
  if (runs.every((r) => r.conclusion === "success" || r.conclusion === "skipped"))
    return "success";
  return "pending";
}

function deriveReviewDecision(
  reviews: Review[]
): EnrichedPR["reviewDecision"] {
  if (reviews.length === 0) return null;
  const latestByUser = new Map<string, Review>();
  for (const r of reviews) {
    if (r.state === "COMMENTED" || r.state === "PENDING") continue;
    const existing = latestByUser.get(r.user.login);
    if (
      !existing ||
      new Date(r.submitted_at) > new Date(existing.submitted_at)
    ) {
      latestByUser.set(r.user.login, r);
    }
  }
  const decisions = [...latestByUser.values()];
  if (decisions.some((r) => r.state === "CHANGES_REQUESTED"))
    return "changes_requested";
  if (decisions.some((r) => r.state === "APPROVED")) return "approved";
  return "review_required";
}

function parseTaskProgress(
  body: string | null
): { done: number; total: number } | null {
  if (!body) return null;
  const taskPattern = /- \[([ xX])\]/g;
  let total = 0;
  let done = 0;
  let match;
  while ((match = taskPattern.exec(body)) !== null) {
    total++;
    if (match[1] !== " ") done++;
  }
  if (total === 0) return null;
  return { done, total };
}

export function createGitHubAPI(token: string): GitHubAPI {
  return new GitHubAPI(token);
}

export type { GitHubAPI };
