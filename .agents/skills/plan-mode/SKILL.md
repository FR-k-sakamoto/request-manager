---
name: plan-mode
description: Implementation planning and requirements clarification in Plan mode with strict KISS, MUI, and clean architecture constraints, plus impact analysis (files to edit) and effort sizing for parallel workstreams. Use when the user asks to brainstorm a plan, define requirements, or estimate scope/affected files without writing code.
---

# Plan Mode

## Overview

Use this skill to run a plan-only session that turns ambiguous requests into a clear implementation plan, enforces KISS/MUI/clean architecture, and outputs impact analysis and sizing for parallel work.

## Workflow

1. Confirm scope.
   - Restate the goal in one sentence.
   - Identify the system/app/module in scope.
   - List hard constraints (KISS, MUI, clean architecture, existing design system).

2. Ask only essential questions.
   - Ask up to 3-5 questions that materially change the plan.
   - If unanswered, proceed with explicit assumptions.

3. Plan at the right level.
   - Provide 3-8 ordered steps.
   - Avoid implementation details unless needed to clarify scope.
   - Do not write code in Plan mode; wait for confirmation before execution.

4. Enforce architecture and UX guardrails.
   - KISS: prefer the simplest viable solution and minimal moving parts.
   - MUI: keep UI within MUI components/theme; avoid non-MUI UI kits.
   - Clean architecture: separate domain/app/presentation concerns; keep UI thin.
   - UX: optimize for clarity, feedback, and minimal friction within the constraints.

5. Produce impact analysis.
   - List likely files to edit and new files to add.
   - Include a short reason per file (e.g., "API handler", "page layout").
   - If unsure, call out the uncertainty and what to inspect next.

6. Estimate implementation size.
   - Give a size label (S/M/L) and a brief rationale.
   - Base sizing on number of files, complexity, and cross-cutting changes.

7. Propose parallel workstreams.
   - Split the plan into streams with non-overlapping files.
   - Highlight any unavoidable conflict points.

## Output Template

Use this structure unless the user requests otherwise.

計画

- 出力言語: 日本語
- 目標:
- 制約:
- 質問:
- 前提:

実装計画

1.
2.
3.

影響分析

- 編集予定ファイル:
- 追加予定ファイル:

規模見積

- 規模:
- 根拠:

並列ワークストリーム（ファイルが競合しない単位で分割）

- ストリームA: 対象機能 / 対象ファイル
- ストリームB: 対象機能 / 対象ファイル
- 競合注意点: 共有ファイルや順序依存があれば記載

リスク / 依存関係

-

## Sizing Heuristics

- S: 1-3 files, localized change, no schema or cross-module impact.
- M: 4-8 files, touches multiple layers or routes, small refactors.
- L: 9+ files, schema changes, cross-system impact, or new flows.

## Notes

- Prompt language can be English, but the response output must be in Japanese. State this explicitly in the plan output.
- Default output language: match the user; if unclear, respond in Japanese.
- If a repo is available, scan for AGENTS.md and follow it before planning.
