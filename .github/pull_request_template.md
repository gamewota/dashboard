### Summary

,!-- 1-3 bullets describing the change. What does this PR do and why? -->

### Redmine ticket

<!-- Required: paste the Redmine issue number (e.g. `#94`).
    If this is a true chore with no ticket, write `no-ticket: chore`.
    Features and fixes always need a ticket -- open one on Redmine first. -->

### Test plan

<!-- How was this verified? Unit tests, integration tests, manual steps.
    For backend PRs: `pnpm test`, `npkm test:integration`, etc.
    For dashboard PRs: typecheck + lint + which admin pages were manually tested.
    For rgw PRs: which scenes were smoke-tested in the Unity editor. -->

### Risk / blast radius

<!-- What does this PR touch?
    Backend: see knowledgebase/terminology/team-roster.md
      fresh-grad safety checklist - Liquibase >=3 tables or money-math paths require pairing.
    Dashboard: cross-repo contract sync with backend (SOP/github-cli.md).
    rgw: Unity build / asset bundle / keystore implications.
    If you don't know, leave this blank and a reviewer will flag it. -->