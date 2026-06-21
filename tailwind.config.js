/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './supabase/functions/_shared/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Remapped to Sherbet candy so every legacy neon-* class becomes friendly.
        neon: {
          cyan: '#46AEF7',    // sky
          magenta: '#FF8FCF', // bubblegum
          green: '#2FD09B',   // mint
          red: '#FF6B81',     // coral
          yellow: '#FFCE3A',  // lemon
        },
        // Remapped to light surfaces (bg = warm ink, used as text-on-bright-pill).
        arcade: {
          bg: '#46383B',   // warm-charcoal ink (text-arcade-bg on bright pills)
          panel: '#FFFFFF', // button / switch surface
          edge: '#F0E0D4',  // hairline
          well: '#FFF1E8',  // sunken
        },
        // ── Sherbet (Vanishing Tiles) semantic palette ──
        // Names kept (void/panel/magenta/cyan…) so existing vt-* classes flip in
        // place; values are Sherbet. Grounds go light, ink goes warm-charcoal,
        // accents become candy. See mockups/sherbet/tokens.css for the source.
        vt: {
          void: '#FFF7F0',    // page ground (was near-black)
          panel: '#FFFFFF',   // cards / surfaces
          raised: '#FFFFFF',  // raised surface
          grid: '#FBEFE6',    // board well
          filled: '#FFF1E8',  // sunken slot
          edge: '#F0E0D4',    // hairline
          magenta: '#FF8FCF', // memory / the gap  → bubblegum
          cyan: '#46AEF7',    // system / active   → sky
          amber: '#FFB13C',   // time / score      → warm amber
          red: '#FF6B81',     // danger / miss     → friendly coral
          lime: '#2FD09B',    // success / streak  → mint
          text: '#46383B',    // warm charcoal ink
          dim: '#9B8B8E',
          faint: '#CDBFC1',
        },
      },
      boxShadow: {
        'neon-cyan': '0 4px 10px rgba(70,174,247,0.25)',
        'neon-magenta': '0 4px 10px rgba(255,143,207,0.25)',
        'neon-green': '0 4px 10px rgba(47,208,155,0.25)',
        'neon-red': '0 4px 10px rgba(255,107,129,0.25)',
        'panel-inset': 'inset 0 2px 8px rgba(180,120,90,0.14)',
        // Soft warm candy elevation — replaces the old neon halos.
        'vt-cyan': '0 6px 14px rgba(70,174,247,0.28)',
        'vt-magenta': '0 6px 14px rgba(255,143,207,0.30)',
        'vt-amber': '0 6px 14px rgba(255,177,60,0.30)',
        'vt-red': '0 6px 14px rgba(255,107,129,0.30)',
        'vt-lime': '0 6px 14px rgba(47,208,155,0.30)',
        'vt-tile': '0 6px 14px rgba(217,150,120,0.22)',
        'vt-pop': '0 14px 30px rgba(214,140,110,0.26)',
      },
      fontFamily: {
        // Sherbet pairing: Fredoka (display) + Nunito (UI). Old aliases remapped
        // so existing font-pixel/grotesk/silk usages become rounded & friendly.
        pixel: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Nunito"', 'ui-rounded', 'system-ui', '-apple-system', 'sans-serif'],
        silk: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        grotesk: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
