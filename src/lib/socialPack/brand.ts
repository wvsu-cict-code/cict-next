export const COVER = { width: 940, height: 1880, cutY: 940 } as const;
/** Height of the photo collage; below it the cover is a white text area. */
export const COLLAGE_HEIGHT = 1500;
export const SQUARE = 940;
export const FOOTER_HEIGHT = 56;

export const NAVY = "#102033";
export const ORANGE = "#F7941D";

export const FOOTER_ITEMS = [
  { icon: "facebook", text: "/cictwvsu" },
  { icon: "x", text: "/cictwvsu" },
  { icon: "mail", text: "cict@wvsu.edu.ph" },
] as const;

export const DEFAULT_LABEL = "UPFLASH";

export const TITLE_BOX = { x: 70, y: 330, width: 800, height: 420 };
export const SUMMARY_BOX = { x: 60, y: 1560, width: 820, height: 240 };
export const SEAL_SIZE = 190;

export const WHITE = "#FFFFFF";
export const BLACK = "#000000";

/** Text sizes, largest first; fitText picks the first that fits. */
export const TITLE_SIZES = [84, 76, 68, 60, 52];
export const TITLE_LINE_HEIGHT = 1.1;
export const SUMMARY_SIZES = [40, 36, 32, 28];
export const SUMMARY_LINE_HEIGHT = 1.22;

/** Logos sit centred above the title, side by side. */
export const LOGO_CENTER_Y = 120;
export const LOGO_GAP = 30;
export const LOGO_RING = 6;
/** White margin between the ring and the logo inside it. */
export const LOGO_INSET = 18;

/**
 * The orange wave behind the title: a closed path of cubic beziers that
 * bleeds off the left edge and wraps TITLE_BOX with room to spare.
 * Each curve is [cp1x, cp1y, cp2x, cp2y, x, y].
 */
export const WAVE = {
  start: [-40, 286],
  curves: [
    [200, 214, 480, 300, 720, 258],
    [860, 234, 936, 266, 930, 380],
    [924, 520, 956, 690, 900, 780],
    [840, 862, 620, 806, 420, 824],
    [220, 842, 60, 806, -40, 820],
  ],
  opacity: 0.92,
} as const;

/** Bottom wash: clear, then orange, then white down to the footer. */
export const WASH = {
  start: 1080,
  peak: 1380,
  white: 1500,
  peakOpacity: 0.85,
} as const;

/** The black label tag and the date after it. */
export const LABEL = {
  x: 60,
  y: 1510,
  height: 42,
  fontSize: 27,
  paddingX: 16,
  dateGap: 18,
} as const;

export const FOOTER_FONT_SIZE = 22;
export const FOOTER_ICON_SIZE = 30;
export const FOOTER_ICON_GAP = 10;
export const FOOTER_ITEM_GAP = 56;
