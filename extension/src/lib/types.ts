export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubBranchRef {
  ref: string;
  sha: string;
  label: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  html_url: string;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  head: GitHubBranchRef;
  base: GitHubBranchRef;
  comments: number;
  body: string | null;
}

export interface CheckRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null;
}

export interface CheckRunsResponse {
  total_count: number;
  check_runs: CheckRun[];
}

export type ReviewState =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "COMMENTED"
  | "DISMISSED"
  | "PENDING";

export interface Review {
  id: number;
  user: GitHubUser;
  state: ReviewState;
  submitted_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface EnrichedPR extends GitHubPullRequest {
  checkStatus: "success" | "failure" | "pending" | "none";
  reviews: Review[];
  reviewDecision: "approved" | "changes_requested" | "review_required" | null;
  taskProgress: { done: number; total: number } | null;
}

export interface RecentBranch {
  name: string;
  lastCommitDate: string;
  lastCommitMessage: string;
  lastCommitSha: string;
  compareUrl: string;
}

export interface DashboardSettings {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  username: string;
  localServerUrl: string;
  repoPaths: string[];
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  githubToken: "",
  repoOwner: "",
  repoName: "",
  username: "",
  localServerUrl: "http://localhost:9876",
  repoPaths: [],
};

export interface LocalRepoInfo {
  path: string;
  currentBranch: string;
  hasChanges: boolean;
}
