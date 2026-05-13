---
name: git-worktree-main-sync
description: Safely sync the latest main branch into a Git worktree feature branch using rebase, detect conflicts, and resolve them with verification. Use when parallel development is running in multiple worktrees and the user asks to pull in main updates, check whether conflicts exist, or fix conflicts before continuing work or opening a PR.
---

# Git Worktree Main Sync

## Overview

Use this skill to integrate `main` into the current worktree branch safely, find conflicts quickly, and finish with a verifiable conflict-free branch.
Run all commands inside the target worktree path.

## Default Pattern (Primary)

Use this as the default multi-worktree flow:

- Worktree A creates a PR and the PR is merged into `main`.
- Worktree B is still in progress on another feature branch.
- Sync Worktree B by rebasing onto `origin/main`.

Default policy:

- Prefer `origin/main` as the only integration source.
- Do not pull/rebase from other remote feature branches by default (`origin/feature-*`).
- If a non-main integration is explicitly requested, stop and confirm risk/intent with the user first.

## Workflow

1. Confirm repository, worktree, and branch.
   - Run `git rev-parse --show-toplevel`.
   - Run `git worktree list`.
   - Run `git branch --show-current`.
   - Refuse to run on `main` directly unless the user explicitly asks.

2. Confirm clean working tree or create a safe checkpoint.
   - Run `git status --short`.
   - If dirty, ask whether to commit or stash first.
   - Before integration, create a safety branch:
     - `git branch backup/$(git branch --show-current)-$(date +%Y%m%d-%H%M%S)`

3. Fetch latest refs and identify authoritative `main`.
   - Run `git fetch origin --prune`.
   - Run `git fetch origin main --prune`.
   - If `origin/main` is missing, discover another remote main with:
     - `git branch -r | rg '/main$'`
   - Report which remote main branch is used.
   - Keep `main` as the integration target unless the user explicitly overrides.

4. Rebase latest `main` into the current branch.
   - Run:
     - `git rebase origin/main`
   - Do not switch to merge for this skill.
   - Do not rebase onto another feature branch as a default shortcut.

5. Detect conflict state immediately.
   - If command exits cleanly, continue to verification.
   - If conflicts occur, list conflicted files:
     - `git diff --name-only --diff-filter=U`

6. Resolve conflicts file by file.
   - Open each conflicted file and resolve semantic intent, not marker syntax only.
   - Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
   - Stage resolved files with `git add <file>`.
   - Re-check unresolved files:
     - `git diff --name-only --diff-filter=U`
   - Continue rebase:
     - `git rebase --continue`

7. Handle difficult conflict cases safely.
   - If a conflict cannot be resolved confidently, stop and ask the user with concrete options.
   - Avoid blind `--ours` or `--theirs`.
   - Rebase caution: in rebase conflicts, `ours` usually maps to `main` side and `theirs` maps to the replayed feature commit.
   - For binary or lockfile conflicts, prefer regeneration or authoritative source files when project policy defines one.

8. Verify post-resolution integrity.
   - Ensure no unmerged paths:
     - `git diff --name-only --diff-filter=U`
   - Ensure no leftover markers:
     - `rg -n '^(<<<<<<<|=======|>>>>>>>)' .`
   - Run quick consistency checks:
     - `git status`
     - project lint/tests (minimum relevant subset)
   - Confirm branch now contains `main`:
     - `git rev-list --left-right --count HEAD...origin/main`
     - Expect right-side count to be `0`.

9. Report and next action.
   - Summarize: rebase result, conflicted files, how each was resolved, verification results.
   - Explicitly state that base was `origin/main` (or why it was not).
   - If branch was previously pushed, recommend:
     - `git push --force-with-lease`

## Response Contract

Always return:

- Commands executed.
- Integration base branch used (default `origin/main`).
- Conflict file list (or explicit "no conflicts").
- Resolution rationale per conflicted file.
- Verification results (markers, status, tests, ahead/behind).
- Any remaining risks or decisions required from the user.
