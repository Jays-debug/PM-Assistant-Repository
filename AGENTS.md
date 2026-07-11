# FleetOS Agent Governance

These instructions apply to the entire repository.

## Platform identity

- The parent platform is **FleetOS — Fleet Operating System**.
- Existing module names remain **AutoPM** and **PM Assistant**.
- Do not rename folders, Python modules, API paths, database tables, URLs, Netlify projects, Railway projects, or application screens unless a later task explicitly approves that scope.

## Mandatory Codex workflow

Every task that may modify code or project files must follow this sequence:

1. Analyze.
2. Explain the proposed change and why it is needed.
3. Describe the architecture impact.
4. Perform a risk analysis, including rollback considerations.
5. Present a file-level plan.
6. Wait for explicit human approval.
7. Modify only the approved files and scope.
8. Run relevant tests or checks.
9. Create a summary of changes, validation, risks, and remaining work.
10. Commit only when explicitly instructed or when the approved task includes a commit.

Application source code must never be modified before explicit human approval.

## Change controls

- Preserve module boundaries between AutoPM and PM Assistant.
- Never expose, copy, or commit secrets or `.env` values.
- Do not deploy, migrate data, alter repository visibility, or change external services without explicit approval.
- Do not modify files outside the approved file list.
- Preserve unrelated user changes.
- Stop and request direction if repository instructions conflict or required context is unavailable.

## Phase 2.0 scope

Phase 2.0 is documentation and governance only. Its approved files are:

- `README.md`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/PHASE_2_PLAN.md`

The following remain out of scope for Phase 2.0:

- `autopm/**`
- `pm-assistant/**`
- database files
- secrets and `.env` values
- Netlify configuration
- Railway configuration
- GitHub Actions
