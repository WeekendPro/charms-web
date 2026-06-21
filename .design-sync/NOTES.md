# design-sync notes — Charms / Sherbet

## Status
First-time sync **not yet executed** — blocked on design-system authorization.
Run **`/design-login`** (or `/login` with a Claude subscription) once, then re-invoke
`/design-sync`. Everything below is settled so the authorized run is just a few calls.

## Repo shape (important)
This repo's design system is **HTML mockups + `mockups/sherbet/tokens.css`**, NOT a
buildable React component library. There is no `dist/`, no Storybook, no `*.stories.*`.
The converter's package/storybook shapes do **not** apply. We use the skill's sanctioned
**off-script** path: upload the `@dsCard`-marked preview HTML directly as cards. The
Design System pane builds its card index from each file's first-line
`<!-- @dsCard group="…" -->` comment, so no `_ds_bundle.js` / compiled-component upload
is produced in this pass.

## Decision (user-confirmed)
**Path A — preview cards now.** Fast, low cost. The design agent gets on-brand visual
references + tokens. It does NOT yet get composable real `<Charm>/<Case>/<Tray>`
components — that's Path B, deferred until the charm-recall mechanic lands in `src/`
(the app is mid-migration off the tetromino mechanic). See
`mockups/sherbet/charms/UPLOAD-PLAN.md`.

## Cards to upload (7) and their groups
- Foundations          → `00-foundations.html`
- Brand & Onboarding   → `01-auth.html`, `02-home.html`
- Gameplay             → `03-countdown.html`, `04-glimpse.html`, `05-find.html`
- Results              → `06-gameover.html`

All 7 carry their `@dsCard` marker on line 1 and were verified rendering in-browser
(screenshots, zero console errors). `tokens.css` is inlined into each preview, so the
cards are self-contained.

## Authorized-run runbook (Path A)
1. `DesignSync list_projects` (confirms auth; pick a non-colliding name).
2. Confirm name "Charms — Sherbet" → `DesignSync create_project`.
3. Record returned `projectId` into `.design-sync/config.json` (pin) **before uploading**.
4. `finalize_plan` with `localDir: "mockups/sherbet/charms"`,
   `writes: ["*.html"]` (the 7 cards). Approve once.
5. `write_files` the 7 cards (localPath uploads). Cards register from `@dsCard` markers.
6. Output project URL `https://claude.ai/design/p/<projectId>`.

(No `_ds_sync.json` anchor in this off-script pass → a future re-sync simply re-verifies,
which is correct.)
