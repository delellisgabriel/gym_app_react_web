import { createTheme, type ThemeOptions } from '@mui/material/styles'

// ─────────────────────────────────────────────────────────────────────────────
// GYM APP — MUI THEME
// Edit the values in BRAND_CONFIG to match your gym's look and feel.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_CONFIG = {
  // ── Color palette ──────────────────────────────────────────────────────────
  primaryMain:   '#1565C0',  // Main brand color (buttons, active nav, accents)
  primaryLight:  '#1E88E5',  // Lighter variant (hover states)
  primaryDark:   '#0D47A1',  // Darker variant (pressed states)

  secondaryMain:  '#F4511E', // Accent / CTA color (warnings, highlights)
  secondaryLight: '#FF7043',
  secondaryDark:  '#BF360C',

  // ── Mode ───────────────────────────────────────────────────────────────────
  mode: 'light' as 'light' | 'dark', // Switch to 'dark' for a dark theme

  // ── Surface colors ─────────────────────────────────────────────────────────
  bgDefault: '#F4F6F9', // Page background
  bgPaper:   '#FFFFFF', // Card / panel background

  // ── Typography ─────────────────────────────────────────────────────────────
  // Tip: add the font to index.html via Google Fonts and update the name here.
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

  // ── Shape ──────────────────────────────────────────────────────────────────
  borderRadius: 10, // Global corner radius in px
}

// ─────────────────────────────────────────────────────────────────────────────
// Do not edit below this line unless you need advanced customization.
// ─────────────────────────────────────────────────────────────────────────────

const themeOptions: ThemeOptions = {
  palette: {
    mode: BRAND_CONFIG.mode,
    primary: {
      main:  BRAND_CONFIG.primaryMain,
      light: BRAND_CONFIG.primaryLight,
      dark:  BRAND_CONFIG.primaryDark,
    },
    secondary: {
      main:  BRAND_CONFIG.secondaryMain,
      light: BRAND_CONFIG.secondaryLight,
      dark:  BRAND_CONFIG.secondaryDark,
    },
    background: {
      default: BRAND_CONFIG.bgDefault,
      paper:   BRAND_CONFIG.bgPaper,
    },
  },
  typography: {
    fontFamily: BRAND_CONFIG.fontFamily,
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
  },
  shape: {
    borderRadius: BRAND_CONFIG.borderRadius,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: BRAND_CONFIG.bgDefault,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 6px rgba(0,0,0,0.07)', borderRadius: BRAND_CONFIG.borderRadius },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: BRAND_CONFIG.borderRadius + 2 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },
  },
}

export const theme = createTheme(themeOptions)
