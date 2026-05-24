# tissue - A File-Based Issue Tracker

A lightweight, decentralized issue tracking system that stores all issues as Markdown files directly in your project repository. Tissue integrates seamlessly with Git, giving you version control, history, and transparency without vendor lock-in.

## Why tissue?

**No Vendor Lock-In** — Unlike server-based issue trackers, tissue stores all issue data as simple Markdown files within your project. Your issues are portable, version-controlled, and accessible to anyone with repository access.

**Git-Native Integration** — Issues live alongside your code in Git. Track changes, see history, and collaborate naturally through your existing Git workflow.

**Simple & Transparent** — Each issue is just a Markdown file. Edit them directly with your text editor, diff them with Git, or browse them in any IDE—no special tools required.

**Lightweight & Fast** — No databases, no complex servers. Works entirely locally with an optional lightweight web interface for browsing.

## Features

- **CLI & Web UI** — Manage issues via command line or optional local web interface
- **Full-Text Issues** — Issues stored as Markdown with title, description, and custom tags/metadata
- **Issue Archival** — Move resolved/archived issues to an archive subfolder to keep active issues clean
- **Tag Support** — Use `#tag` and `@mention` syntax for organization and tracking
- **Git History** — Complete audit trail through Git commits
- **Zero Dependencies on External Services** — Works completely offline

## Installation

### Global Installation (Recommended)

```bash
npm install -g tissue
```

This installs the `tissue` command globally for use in any project.

### Local Installation

```bash
npm install tissue
# Then use: npx tissue <command>
```

## Quick Start

### Initialize a Repository

```bash
# Initialize tissue in current directory
tissue init

# Or initialize in a specific directory
tissue init /path/to/project
```

This creates an `issues/` folder with a `tissue.json` configuration file. Commit this to Git.

### Create a New Issue

```bash
tissue new "Fix login button styling"
```

This creates a new issue file in `issues/` folder and opens it in your default editor. Add your issue description, then save and close.

### List Issues

```bash
# List all active issues
tissue list

# List issues from a specific directory
tissue list --root /path/to/project
```

### Edit an Issue

```bash
# Edit an existing issue by ID
tissue edit lnrxhjed
```

The issue ID is the first part of the issue filename (timestamp-based).

### Web Interface

```bash
# Start the web server
tissue
```

This launches a local web server and opens it in your browser. Browse all issues, create new ones, and manage your project through the UI.

## Project Structure

```
project-root/
├── issues/
│   ├── tissue.json              # Tissue configuration file
│   ├── lnrxhjed-Bug fix.md      # Active issue
│   ├── lns04yfo-New feature.md  # Active issue
│   └── archive/
│       ├── lnrsdsjr-Completed.md  # Archived issue
│       └── ... more archived issues
├── .git/                        # Git repository
└── ... your project files
```

All issues are stored in `issues/` folder, making them easy to version control and browse.

## Issue File Format

Issues are stored as Markdown files with a specific naming convention:

```
{issue_id}-{title}.md
```

Example filename: `lnrxhjed-Fix login validation.md`

Content structure:

```markdown
# Fix login validation

Add email validation to the login form. Currently accepts any string.

## Details
- Should validate email format
- Show error message for invalid email
- Persist validation state

#bug @frontend
```

**Notes:**
- First line is the issue title (H1)
- Remaining content is the issue description
- Use `#tag` syntax for topic tags (e.g., `#bug`, `#feature`, `#documentation`)
- Use `@mention` syntax for team mentions (e.g., `@frontend`, `@database`)

## CLI Commands

### `tissue init [path]`

Initialize a new tissue repository.

- `path` (optional) — Directory to initialize (defaults to current directory)

Example:
```bash
tissue init .
tissue init ~/my-project
```

### `tissue list [--root <path>]`

List all active issues.

- `--root <path>` (optional) — Repository path (defaults to current directory)

Example:
```bash
tissue list
tissue list --root ~/my-project
```

### `tissue new "<title>" [--root <path>]`

Create a new issue.

- `<title>` — Issue title (required)
- `--root <path>` (optional) — Repository path (defaults to current directory)

Example:
```bash
tissue new "Add dark mode support"
tissue new "Fix navbar on mobile" --root ~/my-project
```

### `tissue edit <issue_id> [--root <path>]`

Edit an existing issue.

- `<issue_id>` — Issue ID to edit (required)
- `--root <path>` (optional) — Repository path (defaults to current directory)

Example:
```bash
tissue edit lnrxhjed
tissue edit lns04yfo --root ~/my-project
```

## Git Integration

Tissue works seamlessly with Git:

```bash
# After creating/editing issues, commit them like any other file
git add issues/
git commit -m "Add issues for sprint 5"

# View issue history
git log issues/

# See who created/edited issues
git blame issues/lnrxhjed-*.md

# Diff issue changes
git diff issues/
```

## Archiving Issues

Move resolved issues to the archive to keep your active issues list clean:

1. Move the issue file to `issues/archive/` folder manually, or
2. Rename the issue to reflect completion

Example:
```bash
mv issues/lnrxhjed-Bug-fix.md issues/archive/lnrxhjed-Bug-fix.md
git add issues/
git commit -m "Archive resolved issues"
```

## Configuration

Tissue uses sensible defaults but can be configured via command-line flags:

- `--root <path>` — Specify repository root (defaults to current directory)
- `--port <number>` — Specify web server port for web UI

Example:
```bash
tissue --root ~/my-project --port 3000
```

## Web UI

Launch the web interface to browse and manage issues interactively:

```bash
tissue
```

Features:
- Browse all active issues
- View issue details
- Create new issues via form
- Tag cloud for issue organization
- Archive issues directly from web UI
- Real-time synchronization with file system

## Best Practices

1. **Commit regularly** — Treat issue creation/updates as code commits
   ```bash
   git add issues/
   git commit -m "Add issue: Improve performance"
   ```

2. **Use consistent tags** — Establish team conventions for tags
   ```
   #bug, #feature, #documentation, #chore
   @frontend, @backend, @devops
   ```

3. **Archive old issues** — Move resolved issues to archive to keep the active list focused

4. **Reference in commits** — Link commits to issues in your repository
   ```bash
   git commit -m "Fix login validation (relates to lnrxhjed)"
   ```

5. **Keep descriptions clear** — Write actionable, well-formatted issue descriptions

## Use Cases

- **Small teams** — Perfect for startups and small projects where simplicity matters
- **Offline-first projects** — Work on issues without internet connection
- **Privacy-conscious teams** — All issue data stays in your repository
- **Git-savvy teams** — Leverage existing Git workflows for issue tracking
- **Decentralized collaboration** — Share issues via Git pull requests and discussions
- **Project documentation** — Use issues as a searchable project knowledge base

## Technical Details

**Technology Stack:**
- **Node.js** — Runtime
- **Express-like server** — Lightweight HTTP server for web UI
- **Markdown** — Issue storage format
- **Git** — Version control integration

**Dependencies:**
- `minimist` — CLI argument parsing
- `body` — HTTP request body parsing
- `cachemere` — Response caching
- `openurl` — Open browser automatically
- `string-template` — Template rendering

## License

MIT

## Contributing

Contributions welcome! Please submit issues and pull requests on [GitHub](https://github.com/smeans/tissue).