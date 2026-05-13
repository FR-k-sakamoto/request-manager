---
name: git-pr-flow
description: Run a repository wrap-up Git workflow for completed changes. Use when Codex is asked to verify work with commands like format or build, create a feature branch, make granular commits, draft a PR body in a temporary markdown file, and open a GitHub PR against the requested base branch.
---

# Git PR Flow

Execute this workflow when the user wants an implementation wrapped up and delivered through GitHub.

## Workflow

1. Inspect the repository state first.
   - Run `git status --short`.
   - Check the current branch with `git branch --show-current`.
   - Confirm `gh` is available before planning PR creation.
   - If unrelated dirty files exist, do not revert them. Commit only the requested work.

2. Run the requested verification commands before branching or committing.
   - Prefer the repository's documented order if it exists.
   - For repos like this one, default to `npm run format` first and then the requested validation commands such as `npm run build`.
   - If a command fails because of an environment issue, report the exact blocker and continue only when the user still wants the flow completed.

3. Create a feature branch from the current base branch.
   - Use a descriptive name such as `feature/<topic>-YYYYMMDD` unless the user specifies another convention.
   - Example: `feature/ui-law-notice-admin-updates-20260311`.

4. Commit in the smallest safe units.
   - Prefer one file per commit when that still produces a coherent history.
   - If a file depends on another new file or shared utility, commit the smallest dependency-safe set instead of forcing a broken sequence.
   - Stage explicitly with `git add -- <path>`.
   - Use only non-interactive Git commands.
   - Write direct commit messages that describe the user-visible change in that file or unit.

5. Draft the PR body in a temporary markdown file.
   - Create a file under `.tmp/` with a dated, descriptive name such as `.tmp/pr_body_YYYYMMDD_<topic>.md`.
   - If `.github/PULL_REQUEST_TEMPLATE.md` exists, mirror its section structure and fill it in instead of inventing a new format.
   - Include:
     - background
     - purpose
     - change summary for each requested item
     - screenshots when relevant
     - verification commands that were run
     - risks or follow-ups
   - Keep the PR body reviewer-oriented, not a raw shell log.

6. Push and create the PR.
   - Push with upstream tracking: `git push -u origin <branch>`.
   - Create the PR with `gh pr create`.
   - Default the base branch to the user-specified branch. If they do not specify one, use the repository's usual default branch.
   - Use `--body-file` and point it to the temporary markdown file.

7. Clean up and report back.
   - Remove the temporary markdown file after PR creation unless the user asks to keep it.
   - Confirm the worktree is clean with `git status --short`.
   - Return the branch name, PR title, and PR URL.

## Guardrails

- Never use destructive Git commands unless the user explicitly requests them.
- Never amend existing commits unless the user asks for it.
- Do not hide failed verification. State what passed and what did not.
- Prefer deterministic shell commands over interactive Git tooling.

## Example Trigger Phrases

- "run format and build, then cut a branch and make the PR"
- "commit this in small units and open a PR to main"
- "use the usual git flow for this work"
