#!/usr/bin/env bash
# Tidy the repo root by moving stale migration / audit docs into docs/
# and clearing leftover server logs. Audit CQ-08.
#
# Idempotent: re-running after a successful move is a no-op because every
# target file is checked with `-f` before the move and every directory is
# created with `mkdir -p`.
#
# Run from the repository root:
#
#     bash scripts/tidy-repo-root.sh
#
# Files moved:
#   - REACT-19-CODEX-PROMPTS.md, PERF-CODEX-PROMPTS.md  → docs/migrations/
#   - AUDIT-PLAN.md, AUDIT-INSIGHTS.md, AUDIT-SERVICES.md,
#     AUDIT_ARTICLE_PAGE.md, AUDIT_RESOURCES_PAGE.md     → docs/audits/
#
# Files removed:
#   - serve-4174.log (leftover from a local `vite preview` session;
#     already covered by `*.log` in .gitignore)
#
# Files NOT moved:
#   - AUDIT-HOME-PAGE.md — kept in repo root because it is the active
#     audit being worked through. Once that batch is closed out, move it
#     to docs/audits/ manually.

set -euo pipefail

mkdir -p docs/migrations docs/audits

move_if_present() {
  local src="$1"
  local dest="$2"
  if [[ -f "$src" ]]; then
    git mv "$src" "$dest" 2>/dev/null || mv "$src" "$dest"
    echo "moved: $src → $dest"
  fi
}

move_if_present REACT-19-CODEX-PROMPTS.md docs/migrations/
move_if_present PERF-CODEX-PROMPTS.md     docs/migrations/

move_if_present AUDIT-PLAN.md          docs/audits/
move_if_present AUDIT-INSIGHTS.md      docs/audits/
move_if_present AUDIT-SERVICES.md      docs/audits/
move_if_present AUDIT_ARTICLE_PAGE.md  docs/audits/
move_if_present AUDIT_RESOURCES_PAGE.md docs/audits/

if [[ -f serve-4174.log ]]; then
  rm -v serve-4174.log
fi

# Also drop the two stub files left over by audit CQ-09 (types.ts /
# constants.tsx in repo root). The real definitions now live in
# `types/index.ts` and `constants/index.ts`. Safe to delete because
# `from '../types'` / `from '../constants'` resolves to the index file
# automatically once the stub is gone.
move_remove_stub() {
  local src="$1"
  if [[ -f "$src" ]] && grep -q "Audit CQ-09" "$src"; then
    rm -v "$src"
  fi
}
move_remove_stub types.ts
move_remove_stub constants.tsx

echo "Done. Review the result with: git status"
