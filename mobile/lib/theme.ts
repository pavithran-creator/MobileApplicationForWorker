/**
 * Centralized Design System & Theme Tokens
 * Perfectly matching frontend/tailwind.config.js and frontend/app/globals.css
 */

export const colors = {
  // Brand colors from web theme
  brand: {
    primary: "#0F5132", // brand-primary: Deep emerald
    hover: "#0B3D26",   // brand-hover
    light: "#E8F5E9",   // brand-light
    accent: "#198754",  // brand-accent: Vibrant green
    dark: "#064E3B",    // emerald-900 (Navbar background)
    darker: "#022C22",  // emerald-950 (Navbar bottom border)
    emerald800: "#065F46",
    emerald700: "#047857",
    emerald600: "#059669",
    emerald100: "#D1FAE5",
    emerald50: "#ECFDF5",
  },
  // Surface colors
  surface: {
    bg: "#F8FAFC",       // surface-bg: Clean light slate/off-white
    pageBg: "#FAFAFA",   // Landing page off-white background
    card: "#FFFFFF",     // surface-card
    border: "#E2E8F0",   // surface-border
    borderSubtle: "#F1F5F9",
    muted: "#F8FAFC",
  },
  // Text colors
  text: {
    primary: "#0F172A",   // slate-900: Deep dark slate
    secondary: "#475569", // slate-600
    muted: "#64748B",     // slate-500
    subtle: "#94A3B8",    // slate-400
    white: "#FFFFFF",
    emerald: "#065F46",
    emeraldDark: "#064E3B",
  },
  // Status indicators
  status: {
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#2563EB",
  },
  // Badge background/border pairs
  badge: {
    greenBg: "#ECFDF5",
    greenBorder: "#A7F3D0",
    greenText: "#065F46",
    blueBg: "#EFF6FF",
    blueBorder: "#BFDBFE",
    blueText: "#1D4ED8",
    amberBg: "#FFFBEB",
    amberBorder: "#FDE68A",
    amberText: "#B45309",
    redBg: "#FEF2F2",
    redBorder: "#FECACA",
    redText: "#B91C1C",
    purpleBg: "#F5F3FF",
    purpleBorder: "#DDD6FE",
    purpleText: "#6D28D9",
  },
};

export const shadows = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
};

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export default {
  colors,
  shadows,
  radii,
};
