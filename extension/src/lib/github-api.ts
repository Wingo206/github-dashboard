import type {
  GitHubPullRequest,
  GitHubUser,
  CheckRunsResponse,
  Review,
  GitHubBranch,
  EnrichedPR,
  RecentBranch,
  RepoActivity,
} from "./types";

interface ActivityEntry {
  ref: string;
  timestamp: string;
  activity_type: string;
  actor: { login: string };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

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

  private async requestWithLinks<T>(path: string): Promise<{ data: T; nextUrl: string | null }> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const link = res.headers.get("link");
    let nextUrl: string | null = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) nextUrl = match[1];
    }
    const data = await res.json() as T;
    return { data, nextUrl };
  }

  private async graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`GitHub GraphQL error: ${res.status} ${res.statusText}`);
    }
    const json = await res.json() as GraphQLResponse<T>;
    if (json.errors?.length) {
      throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
    }
    return json.data!;
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

  private async getPushActivity(
    owner: string,
    repo: string,
    username: string,
    timePeriod: string,
  ): Promise<ActivityEntry[]> {
    const activities: ActivityEntry[] = [];
    let url: string | null =
      `/repos/${owner}/${repo}/activity?activity_type=push&actor=${username}&time_period=${timePeriod}&per_page=100`;
    while (url) {
      const result: { data: ActivityEntry[]; nextUrl: string | null } =
        await this.requestWithLinks<ActivityEntry[]>(url);
      activities.push(...result.data);
      url = result.nextUrl;
    }
    return activities;
  }

  async getRepoActivity(
    owner: string,
    repo: string,
    username: string,
    timePeriod: string,
  ): Promise<RepoActivity[]> {
    const activities: RepoActivity[] = [];
    let url: string | null =
      `/repos/${owner}/${repo}/activity?actor=${username}&time_period=${timePeriod}&per_page=100`;
    while (url) {
      const result: { data: RepoActivity[]; nextUrl: string | null } =
        await this.requestWithLinks<RepoActivity[]>(url);
      activities.push(...result.data);
      url = result.nextUrl;
    }
    return activities;
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
    const timePeriod = days <= 1 ? "day" : days <= 7 ? "week" : days <= 30 ? "month" : "quarter";
    const activities = await this.getPushActivity(owner, repo, username, timePeriod);
    const branchNames = [...new Set(
      activities
        .map((a) => a.ref?.replace("refs/heads/", ""))
        .filter(Boolean)
    )];

    if (branchNames.length === 0) return [];

    const BATCH_SIZE = 50;
    const results: RecentBranch[] = [];

    for (let start = 0; start < branchNames.length; start += BATCH_SIZE) {
      const batch = branchNames.slice(start, start + BATCH_SIZE);
      const fragments = batch.map((name, i) => `
        b${i}: ref(qualifiedName: ${JSON.stringify(`refs/heads/${name}`)}) {
          name
          target {
            ... on Commit {
              oid
              author { date }
              message
            }
          }
          associatedPullRequests(first: 1, states: [OPEN, CLOSED, MERGED]) {
            totalCount
          }
        }
      `);

      const query = `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) { ${fragments.join("")} }
      }`;

      type RefResult = {
        name: string;
        target: { oid: string; author: { date: string }; message: string };
        associatedPullRequests: { totalCount: number };
      } | null;
      type RepoResult = { repository: Record<string, RefResult> };

      const data = await this.graphql<RepoResult>(query, { owner, repo });

      for (let i = 0; i < batch.length; i++) {
        const ref = data.repository[`b${i}`];
        if (!ref || ref.associatedPullRequests.totalCount > 0) continue;
        const commit = ref.target;
        results.push({
          name: ref.name,
          lastCommitDate: commit.author.date,
          lastCommitMessage: commit.message.split("\n")[0],
          lastCommitSha: commit.oid,
          compareUrl: `https://github.com/${owner}/${repo}/compare/${encodeURIComponent(ref.name)}?expand=1`,
        });
      }
    }

    return results.sort(
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
