// src/data/accessibility/theme-tokens.ts
// Tokens partagés pour les composants React
// Tous les composants importent ces tokens au lieu de couleurs en dur
// Les valeurs sont des var(--xxx) qui s'adaptent automatiquement au thème

export const T = {
  // Backgrounds
  bgPrimary:      "var(--bg-primary)",
  bgSecondary:    "var(--bg-secondary)",
  bgTertiary:     "var(--bg-tertiary)",
  bgCard:         "var(--bg-card)",
  bgInput:        "var(--bg-input)",

  // Text
  textPrimary:    "var(--text-primary)",
  textSecondary:  "var(--text-secondary)",
  textMuted:      "var(--text-muted)",
  textDisabled:   "var(--text-disabled)",

  // Borders
  border:         "var(--border-color)",
  borderHover:    "var(--border-hover)",

  // Accents
  primary:        "var(--accent-primary)",
  primaryLight:   "var(--accent-primary-light)",
  success:        "var(--accent-success)",
  successLight:   "var(--accent-success-light)",
  warning:        "var(--accent-warning)",
  warningLight:   "var(--accent-warning-light)",
  danger:         "var(--accent-danger)",
  dangerLight:    "var(--accent-danger-light)",
  purple:         "var(--accent-purple)",
  purpleLight:    "var(--accent-purple-light)",

  // Shadows
  shadowSm:       "var(--shadow-sm)",
  shadowMd:       "var(--shadow-md)",

  // Radius
  radiusSm:       "var(--radius-sm)",
  radiusMd:       "var(--radius-md)",
  radiusLg:       "var(--radius-lg)",
} as const;
