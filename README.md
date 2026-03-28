# GitHub Dashboard

A personal Chrome extension for tracking your GitHub pull requests and branches, with optional local git operations via a companion server.

## Features

- **My Pull Requests** -- PRs you created, enriched with CI status, review approvals, task progress, and target branch
- **Assigned to Me** -- PRs where you are an assignee
- **Recent Branches** -- Branches you pushed to in the last 7 days, with one-click "Create PR" links
- **Branch Checkout** -- Checkout any PR branch on your local machine (requires companion server)
- **Multiple Local Repos** -- Configure several local copies of the same repository for checkout
- All links open in new tabs

## Setup

### 1. Chrome Extension

```bash
cd extension
npm install
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

Click the extension icon to open the dashboard. On first use, you'll be taken to Settings where you need to enter:

- **GitHub Personal Access Token** -- See [Token Permissions](#token-permissions) below
- **Repository owner and name** -- e.g. `octocat` / `my-repo`
- **Username** -- Can be auto-detected from your token

### Token Permissions

Generate a token at [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens/new).

**Classic token**: grant the `repo` scope (or `public_repo` for public repos only).

**Fine-grained token**: select the organization as the **Resource owner** if the repo belongs to an org, then grant these **Repository permissions** (read-only):

| Permission | Required | Used for |
|---|---|---|
| **Metadata** | Yes | Baseline access to repository info |
| **Pull requests** | Yes | Listing PRs, reviews, and comments |
| **Contents** | Yes | Reading branches and commit data |
| **Commit statuses** | Yes | Commit status checks on PRs |
| **Actions** | Recommended | CI/check run results on PRs |

If the organization requires approval for fine-grained tokens, an admin will need to approve your token after creation.

### 2. Companion Server (optional)

The companion server enables local git operations like checking out PR branches. Skip this if you only need the dashboard view.

```bash
cd server
npm install
```

Configure your local repo paths in `server/config.json`:

```json
{
  "repoPaths": [
    "/home/user/projects/my-repo",
    "/home/user/projects/my-repo-2"
  ]
}
```

Run the server:

```bash
npm run dev
```

The server starts on `http://localhost:9876` by default. You can also set `PORT` in the environment.

Repo paths can also be managed from the extension's Settings page and via the server's `/config` endpoint.

## Development

### Extension

```bash
cd extension
npm run dev    # watch mode -- rebuilds on file changes
```

After each rebuild, go to `chrome://extensions` and click the reload button on the extension card.

### Server

```bash
cd server
npm run dev    # runs with tsx watch for auto-restart
```

## Server API

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Server status and configured repo paths |
| `/repos` | GET | List repos with current branch and dirty status |
| `/repos/:index/branches` | GET | Local branches for a given repo |
| `/checkout` | POST | Checkout a branch: `{ repoPath, branch }` |
| `/config` | GET | Current server config |
| `/config` | POST | Update config: `{ repoPaths: [...] }` |
