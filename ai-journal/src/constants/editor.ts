// ─── Editor-wide constants ──────────────────────────────────────────────────

export const FONTS = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Comic Sans MS',
  'Impact',
  'Palatino Linotype',
  'Tahoma',
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] as const;

export const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 175, 200] as const;

/** A4 page dimensions in pixels at 96 dpi */
export const PAGE = {
  /** 816px ≈ 8.5 inches */
  WIDTH: 816,
  /** 1056px ≈ 11 inches */
  HEIGHT: 1056,
  /** 96px ≈ 1 inch top/bottom padding */
  PADDING_Y: 96,
  /** 96px ≈ 1 inch left/right padding */
  PADDING_X: 96,
} as const;

/**
 * Maps our pt font sizes to execCommand fontSize levels (1–7).
 * execCommand only supports 7 discrete sizes, so we bucket our values.
 */
export const PT_TO_EXEC_LEVEL = (ptIndex: number): number => {
  if (ptIndex < 2) return 1;
  if (ptIndex < 4) return 2;
  if (ptIndex < 6) return 3;
  if (ptIndex < 8) return 4;
  if (ptIndex < 10) return 5;
  if (ptIndex < 12) return 6;
  return 7;
};
