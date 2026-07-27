/* ═══════════════════════════════════════════════════
   GLOBAL DESIGN TOKENS
   Change here → updates everywhere automatically
═══════════════════════════════════════════════════ */

export const TOKENS = {

  /* ── Icon sizes ── */
  icon: {
    nav:        18,   // sidebar nav icons
    navBox:     25,   // sidebar icon wrapper (height & width)
    card:       23,   // icons inside stat cards (sits in 25px box)
    cardBox:    33,   // stat card icon wrapper (height & width)
    section:    18,   // section heading icons (skill gap, etc.)
    sectionBox: 36,   // section icon wrapper
    logout:     18,   // logout button icon
    collapse:   16,   // sidebar collapse toggle
    activeArrow:16,   // active nav chevron
    badge:      12,   // icons inside badges
    button:     13,   // icons inside buttons
    inline:     14,   // icons inline with text
  },

  /* ── Colors ──
     Sourced from the CSS custom properties in index.css so these tokens
     stay correct across both light and dark themes. */
  color: {
    /* Text */
    textPrimary:   'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted:     'var(--text-muted)',
    textEmail:     'var(--text-secondary)',   // sidebar email, sub-labels
    textLabel:     'var(--text-secondary)',   // stat card labels, card meta

    /* Accent — brand colors stay constant across themes.
       Kept as hex (not var()) because callers build alpha variants via
       string concatenation, e.g. `${color}18` — invalid with a var() string. */
    primary:       '#6366F1',
    secondary:     '#8B5CF6',
    success:       '#10B981',
    warning:       '#F59E0B',
    danger:        '#EF4444',

    /* Card heading — consistent across ALL pages */
    cardHeading:   'var(--text-primary)',    // main card titles
    cardSubLabel:  'var(--text-secondary)',  // secondary labels inside cards
    cardValue:     'var(--text-primary)',    // large number values
    cardValueSub:  'var(--text-secondary)',  // small text under values
  },

  /* ── Typography ── */
  font: {
    /* Card headings */
    cardTitleSize:   15,
    cardTitleWeight: 600,

    /* Section labels (uppercase eyebrow) */
    eyebrowSize:     11,
    eyebrowWeight:   600,
    eyebrowSpacing:  '0.08em',

    /* Stat card value */
    statValueSize:   28,
    statValueWeight: 800,

    /* Stat card label */
    statLabelSize:   11,
    statLabelWeight: 600,

    /* Missing skill label */
    skillLabelSize:  13,
    skillLabelWeight:600,

    /* Progress bar label */
    progressLabelSize: 13,

    /* Body */
    bodySize:        13,
    bodyWeight:      400,

    /* Letter spacing defaults */
    spacingTight:   '0.02em',
    spacingNormal:  '0.04em',
    spacingWide:    '0.07em',
    spacingXWide:   '0.10em',
  },

  /* ── Spacing ── */
  space: {
    cardPadding:     22,
    sectionGap:      20,
    itemGap:         12,
    iconTextGap:     10,
  },

  /* ── Border radius ── */
  radius: {
    card:   16,
    inner:  10,
    small:  8,
    pill:   20,
    circle: '50%',
  },
};