/**
 * HomeTick design system — single source of truth for colours, spacing, and
 * typography. Import this wherever you need consistent values.
 */

export const colors = {
  primary: '#4F46E5',       // Indigo — brand colour
  primaryLight: '#818CF8',  // Light indigo
  primaryDark: '#3730A3',   // Dark indigo
  secondary: '#10B981',     // Emerald green — completion / success
  secondaryLight: '#6EE7B7',
  warning: '#F59E0B',       // Amber
  danger: '#EF4444',        // Red
  background: '#F9FAFB',    // Light grey page background
  surface: '#FFFFFF',       // Card / sheet surface
  border: '#E5E7EB',        // Subtle divider
  text: '#111827',          // Near-black body text
  textSecondary: '#6B7280', // Muted label text
  textDisabled: '#9CA3AF',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  button: { fontSize: 15, fontWeight: '600' },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};
