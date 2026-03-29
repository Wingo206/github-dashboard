import type { IGitHubAPI } from "./github-api";
import type {
  GitHubUser,
  EnrichedPR,
  RecentBranch,
  RepoActivity,
  ActivityType,
  ReviewState,
} from "./types";

const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function fakeSha(): string {
  return Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

const MOCK_USERS: GitHubUser[] = [
  { login: "mockuser", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4", html_url: "https://github.com/mockuser" },
  { login: "alice", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4", html_url: "https://github.com/alice" },
  { login: "bob", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4", html_url: "https://github.com/bob" },
  { login: "carol", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4", html_url: "https://github.com/carol" },
  { login: "dave", avatar_url: "https://avatars.githubusercontent.com/u/5?v=4", html_url: "https://github.com/dave" },
];

const CURRENT_USER = MOCK_USERS[0];

const PR_TITLES = [
  "feat: add dark mode support",
  "fix: resolve race condition in data fetching",
  "refactor: extract shared utilities",
  "chore: upgrade dependencies to latest versions",
  "feat: implement search filtering",
  "fix: correct pagination offset calculation",
  "feat: add keyboard shortcuts for navigation",
  "docs: update API reference documentation",
  "fix: handle edge case in date parsing",
  "feat: add export to CSV functionality",
  "refactor: simplify state management logic",
  "fix: prevent duplicate network requests",
  "feat: add real-time notification badge",
  "chore: migrate to new build toolchain",
  "feat: implement drag-and-drop reordering",
  "fix: resolve memory leak in event listeners",
  "feat: add user preference persistence",
  "refactor: consolidate API client methods",
];

const LABEL_POOL = [
  { id: 1, name: "bug", color: "d73a4a" },
  { id: 2, name: "enhancement", color: "a2eeef" },
  { id: 3, name: "documentation", color: "0075ca" },
  { id: 4, name: "good first issue", color: "7057ff" },
  { id: 5, name: "help wanted", color: "008672" },
  { id: 6, name: "priority: high", color: "b60205" },
  { id: 7, name: "priority: low", color: "0e8a16" },
  { id: 8, name: "refactor", color: "e4e669" },
  { id: 9, name: "dependencies", color: "0366d6" },
  { id: 10, name: "breaking change", color: "d93f0b" },
];

const CHECK_STATUSES: EnrichedPR["checkStatus"][] = ["success", "failure", "pending", "none"];
const REVIEW_DECISIONS: EnrichedPR["reviewDecision"][] = ["approved", "changes_requested", "review_required", null];

const BRANCH_PREFIXES = ["feat", "fix", "refactor", "chore", "docs", "test", "perf"];
const BRANCH_NAMES = [
  "dark-mode", "search-bar", "api-v2", "login-flow", "cache-layer",
  "error-handling", "responsive-layout", "accessibility", "analytics",
  "migration", "rate-limiting", "webhook-handler", "batch-processing",
  "lazy-loading", "ssr-support",
];

const COMMIT_MESSAGES = [
  "wip: initial implementation",
  "add unit tests for edge cases",
  "fix lint warnings",
  "clean up unused imports",
  "implement review feedback",
  "update snapshot tests",
  "refactor to use new utility",
  "handle null case properly",
  "add error boundary",
  "optimize re-renders",
  "extract into separate component",
  "update types for stricter checking",
  "add integration test",
  "remove deprecated usage",
  "simplify conditional logic",
];

const ACTIVITY_TYPES: ActivityType[] = [
  "push", "push", "push",
  "force_push",
  "branch_creation", "branch_creation",
  "branch_deletion",
  "pr_merge", "pr_merge",
  "merge_queue_merge",
];

function buildMockPRs(): EnrichedPR[] {
  const count = 18;
  const prs: EnrichedPR[] = [];

  for (let i = 0; i < count; i++) {
    const author = i < 8 ? CURRENT_USER : randomFrom(MOCK_USERS.slice(1));
    const isAssignedToMe = i >= 8 && i < 14;
    const assignees = isAssignedToMe
      ? [CURRENT_USER, ...(Math.random() > 0.5 ? [randomFrom(MOCK_USERS.slice(1))] : [])]
      : [author];
    const isDraft = i % 7 === 0;
    const checkStatus = CHECK_STATUSES[i % CHECK_STATUSES.length];
    const reviewDecision = isDraft ? null : REVIEW_DECISIONS[i % REVIEW_DECISIONS.length];
    const hasTaskProgress = i % 3 === 0;

    const labelCount = Math.floor(Math.random() * 3);
    const labels = LABEL_POOL.slice(i % LABEL_POOL.length, (i % LABEL_POOL.length) + labelCount);

    const sha = fakeSha();
    const branchName = `${randomFrom(BRANCH_PREFIXES)}/${BRANCH_NAMES[i % BRANCH_NAMES.length]}`;

    const reviewers = MOCK_USERS.slice(1, 1 + (i % 3));
    const reviewStates: ReviewState[] = ["APPROVED", "CHANGES_REQUESTED", "COMMENTED"];
    const reviews = reviewers.map((user, ri) => ({
      id: i * 100 + ri,
      user,
      state: reviewStates[ri % reviewStates.length],
      submitted_at: daysAgo(Math.floor(Math.random() * 5)),
    }));

    prs.push({
      id: 1000 + i,
      number: 100 + i,
      title: PR_TITLES[i % PR_TITLES.length],
      state: "open",
      draft: isDraft,
      html_url: `https://github.com/mock-owner/mock-repo/pull/${100 + i}`,
      user: author,
      assignees,
      labels,
      created_at: daysAgo(10 + i),
      updated_at: daysAgo(i % 5),
      merged_at: null,
      head: { ref: branchName, sha, label: `mock-owner:${branchName}` },
      base: { ref: "main", sha: fakeSha(), label: "mock-owner:main" },
      comments: Math.floor(Math.random() * 15),
      body: hasTaskProgress
        ? "## Tasks\n- [x] Design\n- [x] Implementation\n- [ ] Tests\n- [ ] Documentation\n- [ ] Review"
        : "This PR implements the feature as described in the issue.",
      checkStatus,
      reviews,
      reviewDecision,
      taskProgress: hasTaskProgress ? { done: 2, total: 5 } : null,
    });
  }

  return prs;
}

function buildMockBranches(): RecentBranch[] {
  const count = 12;
  const branches: RecentBranch[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = BRANCH_PREFIXES[i % BRANCH_PREFIXES.length];
    const name = BRANCH_NAMES[i % BRANCH_NAMES.length];
    branches.push({
      name: `${prefix}/${name}`,
      lastCommitDate: daysAgo(i),
      lastCommitMessage: COMMIT_MESSAGES[i % COMMIT_MESSAGES.length],
      lastCommitSha: fakeSha(),
      compareUrl: `https://github.com/mock-owner/mock-repo/compare/${prefix}/${name}?expand=1`,
    });
  }

  return branches;
}

function buildMockActivity(): RepoActivity[] {
  const count = 30;
  const activities: RepoActivity[] = [];

  for (let i = 0; i < count; i++) {
    const activityType = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
    const branchName = BRANCH_NAMES[i % BRANCH_NAMES.length];
    const actor = MOCK_USERS[i % MOCK_USERS.length];

    activities.push({
      id: 2000 + i,
      ref: `refs/heads/${randomFrom(BRANCH_PREFIXES)}/${branchName}`,
      timestamp: daysAgo(Math.floor(i / 3)),
      activity_type: activityType,
      actor: { login: actor.login, avatar_url: actor.avatar_url },
      before: fakeSha(),
      after: fakeSha(),
    });
  }

  return activities;
}

class MockGitHubAPI implements IGitHubAPI {
  async getCurrentUser(): Promise<GitHubUser> {
    await delay();
    return CURRENT_USER;
  }

  async getEnrichedPullRequests(): Promise<EnrichedPR[]> {
    await delay();
    return buildMockPRs();
  }

  async getRecentBranches(): Promise<RecentBranch[]> {
    await delay();
    return buildMockBranches();
  }

  async getRepoActivity(): Promise<RepoActivity[]> {
    await delay();
    return buildMockActivity();
  }
}

export function createMockGitHubAPI(_token: string): IGitHubAPI {
  return new MockGitHubAPI();
}
