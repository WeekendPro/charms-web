# Charms — Sherbet screen set

The **Charms** brand fitted into the **Sherbet** design language. A cozy casual
*memory* game: glimpse a handful of round enamel **Charms**, watch them slip away,
then **Find** them from a **Tray** against a gentle clock.

These are self-contained, portrait (~390px) HTML mockups. Fonts: Fredoka + Nunito
(Google Fonts). Colors/shadows/radii come straight from `../tokens.css`.

## Screens

| # | File | Screen |
|---|------|--------|
| 00 | `00-foundations.html` | Charm anatomy, palette, semantic colors, type, glossary |
| 01 | `01-auth.html` | Sign in (email/password · Google · guest), CHARMS wordmark |
| 02 | `02-home.html` | Play + difficulty selector + Bracelet peek |
| 03 | `03-countdown.html` | 3·2·1 centered inside the empty Case border |
| 04 | `04-glimpse.html` | Charms settle into Settings, then slip away (memorize) |
| 05 | `05-find.html` | Tray recall · good ✓ picks + soft coral ✕ miss · combo |
| 06 | `06-gameover.html` | Encouraging result · score · stars · Charms earned → Bracelet |

## Glossary (used consistently in all copy/labels)

- **Charm** — the round enamel content piece (replaces "tile").
- **Setting** — a single empty round slot (replaces "cell").
- **Case** — the board / grid of Settings (play field).
- **Tray** — the row of candidate Charms during Find.
- **Bracelet** — the player's earned-Charm meta-collection.
- **Glimpse** — the memorize phase.
- **Find** — the recall / selecting phase (kept plain).
- **slip away** — the vanish: a soft shimmer-fade (no glow-bloom, no hard pop).

## The Charm treatment

Round enamel disc = cream/metallic **bezel** rim → candy-hue **enamel** fill (radial
top-light gradient + inset bottom-shade) → top **gloss** sheen → centered **motif**
(emoji in mockups; iconic SVG in production) → soft warm drop shadow so it seats in
its Setting. Aesthetic target: enamel pin / gachapon trinket — broad, not jewelry.

## Signature motion

- **Settle-in** — springy `scale .3 → 1.12 → 1` overshoot as a Charm appears.
- **Slip away** — gentle lift + opacity fade with a single soft shimmer sweep. Light
  theme only: **never** the old dark-theme glow-bloom, **never** a hard pop.
- **Countdown** — 3·2·1 numerals scale-in/fade, centered in the Case.
- **Find feedback** — ✓ settle + mint ring for a good pick; soft coral shake + ✕ for
  a miss (never a harsh red flash).

## Preview

```
cd mockups && python3 -m http.server 8077
# open http://localhost:8077/sherbet/charms/00-foundations.html
```

Or use the `mockups` config in `.claude/launch.json`.

See `UPLOAD-PLAN.md` for the Claude Design (design-sync) sync plan.
