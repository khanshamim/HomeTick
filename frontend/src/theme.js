/**
 * HomeTick design system — single source of truth for colours, spacing, and
 * typography. Translated from the CSS custom-property theme.
 *
 * --primary:       #030213   (near-black brand / header / buttons)
 * --secondary:     #eef0f6   (light blue-gray chip / input bg)
 * --muted:         #ececf0
 * --muted-foreground: #717182
 * --accent:        #e9ebef
 * --destructive:   #d4183d
 * --radius:        0.625rem  → 10 px
 */

export const colors = {
  // ── Primary ────────────────────────────────────────────────────────
  primary:            '#030213',   // near-black — header, buttons, active states
  primaryForeground:  '#ffffff',

  // ── Secondary (chip / surface tint) ────────────────────────────────
  secondary:          '#eef0f6',   // oklch(0.95 0.0058 264.53) — light blue-gray
  secondaryForeground:'#030213',

  // ── Muted / Accent ─────────────────────────────────────────────────
  muted:              '#ececf0',
  mutedForeground:    '#717182',
  accent:             '#e9ebef',
  accentForeground:   '#030213',

  // ── Success (task completion / progress bars) ───────────────────────
  success:            '#10B981',   // Emerald — kept for UX clarity
  successLight:       '#d1fae5',

  // ── Warning ────────────────────────────────────────────────────────
  warning:            '#F59E0B',

  // ── Destructive ────────────────────────────────────────────────────
  destructive:        '#d4183d',
  destructiveForeground: '#ffffff',

  // ── Surfaces ───────────────────────────────────────────────────────
  background:         '#ffffff',
  surface:            '#ffffff',   // card / sheet
  inputBackground:    '#f3f3f5',
  switchBackground:   '#cbced4',

  // ── Border / Divider ───────────────────────────────────────────────
  border:             'rgba(0, 0, 0, 0.1)',

  // ── Text ───────────────────────────────────────────────────────────
  text:               '#1c1c1c',   // oklch(0.145 0 0) — near-black body text
  textSecondary:      '#717182',   // muted-foreground
  textDisabled:       '#a0a0a0',   // ring

  // ── Misc ───────────────────────────────────────────────────────────
  white:              '#ffffff',
  overlay:            'rgba(0,0,0,0.4)',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// --radius: 0.625rem (10 px)
// --radius-sm: calc(var(--radius) - 4px) = 6px
// --radius-md: calc(var(--radius) - 2px) = 8px
// --radius-lg: var(--radius)             = 10px
// --radius-xl: calc(var(--radius) + 4px) = 14px
export const radius = {
  sm:   6,
  md:   8,
  lg:   10,
  xl:   14,
  full: 9999,
};

// CSS theme: --font-weight-medium: 500, h1–h4 all use medium weight
export const typography = {
  h1:        { fontSize: 24, fontWeight: '500', color: colors.text },
  h2:        { fontSize: 20, fontWeight: '500', color: colors.text },
  h3:        { fontSize: 18, fontWeight: '500', color: colors.text },
  h4:        { fontSize: 16, fontWeight: '500', color: colors.text },
  body:      { fontSize: 16, fontWeight: '400', color: colors.text },
  bodySmall: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  label:     { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  button:    { fontSize: 16, fontWeight: '500' },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
};
