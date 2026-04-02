/**
 * MUS Documentation Typography Standards
 * Font Family: DM Sans (all styles)
 * Follows MUS design guidelines for consistent document styling
 *
 * PRODUCTION READY: DM Sans fonts are embedded from ./public/fonts/dm-sans/static/
 * Font variants: Regular, Bold, Italic, BoldItalic (cached on first load)
 */

export const TYPOGRAPHY = {
  // Heading 1: DM Sans, Bold, 28
  heading1: {
    size: 28,
    weight: 'bold',
    fontFamily: 'DM Sans',
  },

  // Heading 2: DM Sans, Bold, 20
  heading2: {
    size: 20,
    weight: 'bold',
    fontFamily: 'DM Sans',
  },

  // Heading 3: DM Sans, Bold, 16
  heading3: {
    size: 16,
    weight: 'bold',
    fontFamily: 'DM Sans',
  },

  // Body: DM Sans, Regular, 12
  body: {
    size: 12,
    weight: 'regular',
    fontFamily: 'DM Sans',
    lineGap: 6,
  },

  // Body (Highlighted): DM Sans, Bold, 12
  bodyHighlighted: {
    size: 12,
    weight: 'bold',
    fontFamily: 'DM Sans',
  },

  // Micro text: DM Sans, Regular, 8
  microText: {
    size: 8,
    weight: 'regular',
    fontFamily: 'DM Sans',
  },

  // Paragraph spacing
  paragraphSpacing: 8,

  // Line height multiplier for body text
  baseLineHeight: 1.5,
};
