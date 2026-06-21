# Claude Design upload plan — Charms / Sherbet

Goal: get the Charms screen set into a **claude.ai/design** design-system project via
the **`/design-sync`** skill + `DesignSync` tool, so it's browsable as cards and
reusable as a source of truth.

## The path question

`design-sync`'s *canonical* input is a built component library (a repo's `dist/` of
preview HTML, one per component/variant). What we have is **7 self-contained preview
HTML mockups + `tokens.css`** — not a React build.

Good news: the `DesignSync` tool does **not** require a `dist/`. The Design System
pane builds its card index from a **first-line `<!-- @dsCard group="…" -->` comment**
in each preview HTML. Our mockups are already exactly that shape: standalone, themed,
renderable previews. So we can sync them **directly as preview cards today** — no build
step, no component extraction required for a first pass.

We therefore have two paths, and we take **A now, B later**.

### Path A — sync the mockups as preview cards (chosen, ready now)

Each screen is already a `@dsCard`-marked preview. Sync the folder as-is.

- ✅ Done: added `<!-- @dsCard group="…" -->` to all 7 files:
  - `Foundations` → `00-foundations.html`
  - `Brand & Onboarding` → `01-auth.html`, `02-home.html`
  - `Gameplay` → `03-countdown.html`, `04-glimpse.html`, `05-find.html`
  - `Results` → `06-gameover.html`
- ✅ Done: `00-foundations.html` carries the tokens story (charm anatomy, 8-hue
  palette, semantic colors, type, glossary) so the design system has a foundations
  page, not just screens.
- Sync bundle = these 8 files (7 HTML + this plan is *not* uploaded; `tokens.css` is
  inlined into each preview already, so the cards are self-contained).

**Execution (run inside `/design-sync`):**
1. `DesignSync list_projects` → pick an existing writable design-system project, or
   `create_project { name: "Charms — Sherbet" }`.
2. Verify target is `PROJECT_TYPE_DESIGN_SYSTEM` (`get_project`).
3. `list_files` on the project → build a structural diff (first sync = all adds).
4. `finalize_plan` with `localDir` = this folder and
   `writes: ["sherbet/charms/*.html"]` (or the 7 explicit paths).
5. `write_files` (localPath uploads — contents never enter model context).
6. Cards register automatically from the `@dsCard` markers (no `register_assets`).

**Blocker (why it may hand back rather than execute):** the first `DesignSync` call
needs **design-system scope on the user's claude.ai login** (or `/design-login` in a
headless session). That's a one-time user approval. If granted, A is a ~5-call run. If
not present, this is the only thing standing between the plan and a live sync.

### Path B — extract a real React component library (productionization, later)

When the Charms target mechanic lands in `src/`, refactor the shared primitives the
mockups already imply into a small library, build to `dist/`, and sync that — so the
design system tracks live components, not static screens:

- `Tokens` (from `tokens.css` → TS/RN export) · `Charm` (bezel/enamel/gloss/motif,
  variants: emoji / symbol / swatch, states: idle / settle / slip / good / miss) ·
  `Setting` · `Case` · `Tray` · `HUD` (score / lives / timer / combo) · `Button`
  (primary / secondary) · `ScorePanel`.
- Each gets a `*.preview.html` per variant with a `@dsCard` marker; `npm run build`
  emits them to `dist/`; `/design-sync` diffs and pushes incrementally.
- This is the right home for RN parity (same hex tokens already in `tailwind.config.js`).

Path B is deferred because the app is mid-migration off the tetromino mechanic; building
components against a moving target would churn. The mockups + tokens are the stable
artifact to sync first.

## Recommendation

Run **Path A** under `/design-sync` once design-system login scope is confirmed. Keep
**Path B** as the follow-up when the charm-recall mechanic is implemented in `src/`.
