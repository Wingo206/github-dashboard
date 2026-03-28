import { useState } from "react";
import type { DashboardSettings } from "../../lib/types";
import { createGitHubAPI } from "../../lib/github-api";
import { StyledFormField, StyledAlertBanner } from "../ui";
import { XIcon } from "./Icons";

interface SettingsProps {
  settings: DashboardSettings;
  onSave: (partial: Partial<DashboardSettings>) => Promise<DashboardSettings>;
  onClose: () => void;
}

export default function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [form, setForm] = useState({ ...settings });
  const [detecting, setDetecting] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof DashboardSettings, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  };

  const detectUsername = async () => {
    if (!form.githubToken) {
      setError("Enter a token first");
      return;
    }
    setDetecting(true);
    setError("");
    try {
      const api = createGitHubAPI(form.githubToken);
      const user = await api.getCurrentUser();
      setForm((f) => ({ ...f, username: user.login }));
    } catch {
      setError("Failed to detect username. Check your token.");
    } finally {
      setDetecting(false);
    }
  };

  const addPath = () => {
    const trimmed = newPath.trim();
    if (trimmed && !form.repoPaths.includes(trimmed)) {
      setForm((f) => ({ ...f, repoPaths: [...f.repoPaths, trimmed] }));
      setNewPath("");
    }
  };

  const removePath = (index: number) => {
    setForm((f) => ({
      ...f,
      repoPaths: f.repoPaths.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setError("");
    if (!form.githubToken || !form.repoOwner || !form.repoName) {
      setError("Token, owner, and repo name are required.");
      return;
    }
    await onSave(form);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gh-text">Settings</h2>
        <button
          onClick={onClose}
          className="text-gh-muted hover:text-gh-text transition-colors"
        >
          <XIcon size={20} />
        </button>
      </div>

      <div className="space-y-5">
        <StyledFormField
          label="GitHub Personal Access Token"
          hint={undefined}
        >
          <input
            type="password"
            value={form.githubToken}
            onChange={(e) => handleChange("githubToken", e.target.value)}
            placeholder="ghp_..."
            className="input-field"
          />
          <p className="text-xs text-gh-muted mt-1">
            Needs <code>repo</code> scope for private repos, or{" "}
            <code>public_repo</code> for public only.
          </p>
        </StyledFormField>

        <div className="grid grid-cols-2 gap-4">
          <StyledFormField label="Repository Owner">
            <input
              type="text"
              value={form.repoOwner}
              onChange={(e) => handleChange("repoOwner", e.target.value)}
              placeholder="octocat"
              className="input-field"
            />
          </StyledFormField>
          <StyledFormField label="Repository Name">
            <input
              type="text"
              value={form.repoName}
              onChange={(e) => handleChange("repoName", e.target.value)}
              placeholder="my-repo"
              className="input-field"
            />
          </StyledFormField>
        </div>

        <StyledFormField label="GitHub Username">
          <div className="flex gap-2">
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="octocat"
              className="input-field flex-1"
            />
            <button
              onClick={detectUsername}
              disabled={detecting}
              className="btn-secondary whitespace-nowrap"
            >
              {detecting ? "Detecting..." : "Auto-detect"}
            </button>
          </div>
        </StyledFormField>

        <StyledFormField
          label="Local Server URL"
          hint="Optional. Used for local git operations like branch checkout."
        >
          <input
            type="text"
            value={form.localServerUrl}
            onChange={(e) => handleChange("localServerUrl", e.target.value)}
            placeholder="http://localhost:9876"
            className="input-field"
          />
        </StyledFormField>

        <StyledFormField label="Local Repository Paths">
          <div className="space-y-2">
            {form.repoPaths.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gh-bg rounded px-3 py-2 border border-gh-border"
              >
                <code className="text-sm text-gh-text flex-1 truncate">
                  {p}
                </code>
                <button
                  onClick={() => removePath(i)}
                  className="text-gh-muted hover:text-gh-red transition-colors shrink-0"
                >
                  <XIcon />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPath()}
                placeholder="/home/user/projects/my-repo"
                className="input-field flex-1"
              />
              <button onClick={addPath} className="btn-secondary">
                Add
              </button>
            </div>
          </div>
        </StyledFormField>

        {error && (
          <StyledAlertBanner variant="error">
            {error}
          </StyledAlertBanner>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} className="btn-primary">
            Save Settings
          </button>
          {saved && (
            <span className="text-sm text-gh-green">Settings saved!</span>
          )}
        </div>
      </div>
    </div>
  );
}
