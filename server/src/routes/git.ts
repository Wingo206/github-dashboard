import { Router } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { loadConfig } from "../config.js";

const execFileAsync = promisify(execFile);
export const gitRouter = Router();

async function git(
  cwd: string,
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync("git", args, { cwd, timeout: 30_000 });
}

gitRouter.get("/repos", async (_req, res) => {
  const config = loadConfig();
  const repos = await Promise.all(
    config.repoPaths.map(async (repoPath) => {
      if (!existsSync(repoPath)) {
        return {
          path: repoPath,
          currentBranch: "not found",
          hasChanges: false,
          error: "Directory does not exist",
        };
      }
      try {
        const [branchResult, statusResult] = await Promise.all([
          git(repoPath, ["rev-parse", "--abbrev-ref", "HEAD"]),
          git(repoPath, ["status", "--porcelain"]),
        ]);
        return {
          path: repoPath,
          currentBranch: branchResult.stdout.trim(),
          hasChanges: statusResult.stdout.trim().length > 0,
        };
      } catch (err) {
        return {
          path: repoPath,
          currentBranch: "unknown",
          hasChanges: false,
          error:
            err instanceof Error ? err.message : "Failed to get repo status",
        };
      }
    })
  );

  res.json({ repos });
});

gitRouter.get("/repos/:index/branches", async (req, res) => {
  const config = loadConfig();
  const index = parseInt(req.params.index, 10);

  if (isNaN(index) || index < 0 || index >= config.repoPaths.length) {
    res.status(400).json({ error: "Invalid repo index" });
    return;
  }

  const repoPath = config.repoPaths[index];
  try {
    const result = await git(repoPath, ["branch", "--list", "--format=%(refname:short)"]);
    const branches = result.stdout
      .trim()
      .split("\n")
      .filter((b) => b.length > 0);
    res.json({ branches });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to list branches",
    });
  }
});

gitRouter.post("/checkout", async (req, res) => {
  const { repoPath, branch } = req.body as {
    repoPath?: string;
    branch?: string;
  };

  if (!repoPath || !branch) {
    res.status(400).json({ error: "repoPath and branch are required" });
    return;
  }

  if (!existsSync(repoPath)) {
    res.status(400).json({ error: "Repository path does not exist" });
    return;
  }

  const config = loadConfig();
  if (!config.repoPaths.includes(repoPath)) {
    res.status(403).json({ error: "Repository path is not in the allowed list" });
    return;
  }

  try {
    await git(repoPath, ["fetch", "origin"]);

    try {
      await git(repoPath, ["checkout", branch]);
    } catch {
      await git(repoPath, ["checkout", "-b", branch, `origin/${branch}`]);
    }

    const result = await git(repoPath, [
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);

    res.json({
      success: true,
      currentBranch: result.stdout.trim(),
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Checkout failed",
    });
  }
});
