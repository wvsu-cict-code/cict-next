import {
  BLACK,
  COVER,
  FOOTER_FONT_SIZE,
  FOOTER_HEIGHT,
  FOOTER_ICON_GAP,
  FOOTER_ICON_SIZE,
  FOOTER_ITEM_GAP,
  FOOTER_ITEMS,
  LABEL,
  LOGO_CENTER_Y,
  LOGO_GAP,
  LOGO_INSET,
  LOGO_RING,
  NAVY,
  ORANGE,
  SEAL_SIZE,
  SQUARE,
  SUMMARY_BOX,
  SUMMARY_LINE_HEIGHT,
  SUMMARY_SIZES,
  TITLE_BOX,
  TITLE_LINE_HEIGHT,
  TITLE_SIZES,
  WASH,
  WAVE,
  WHITE,
} from "./brand";
import { CENTERED, sourceRect, type Crop } from "./crop";
import { LAYOUTS, type LayoutId, type Rect } from "./layouts";
import { fitText, type Measure } from "./text";

export type LoadedImage = {
  url: string;
  image: CanvasImageSource;
  width: number;
  height: number;
};

export type CoverInput = {
  layout: LayoutId;
  slots: { image: LoadedImage | null; crop: Crop }[];
  title: string;
  label: string;
  date: string;
  summary: string;
  logos: LoadedImage[];
};

/** CSS font-family lists for the display (title) and body fonts. */
export type Fonts = { display: string; body: string };

type Ctx = CanvasRenderingContext2D;

const FULL_TURN = Math.PI * 2;
const MAX_LOGOS = 2;

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function prepare(ctx: Ctx) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function measurer(ctx: Ctx, font: (size: number) => string): Measure {
  return (text, size) => {
    ctx.font = font(size);
    return ctx.measureText(text).width;
  };
}

/** Baseline offset that puts the current font's capitals centred on a line. */
function capCentre(ctx: Ctx): number {
  return ctx.measureText("H").actualBoundingBoxAscent / 2;
}

/** Cover-fits a photo into rect; never stretches. */
function drawPhoto(ctx: Ctx, photo: LoadedImage, rect: Rect, crop: Crop) {
  const src = sourceRect(photo, rect, crop);
  ctx.drawImage(
    photo.image,
    src.x,
    src.y,
    src.width,
    src.height,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );
}

function drawCollage(ctx: Ctx, input: CoverInput) {
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, COVER.width, COVER.height);
  LAYOUTS[input.layout].slots.forEach((rect, i) => {
    const slot = input.slots[i];
    if (slot?.image) drawPhoto(ctx, slot.image, rect, slot.crop);
  });
}

function drawWave(ctx: Ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(WAVE.start[0], WAVE.start[1]);
  for (const [c1x, c1y, c2x, c2y, x, y] of WAVE.curves) {
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
  }
  ctx.closePath();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = rgba(ORANGE, WAVE.opacity);
  ctx.fill();
  ctx.restore();
}

function drawWash(ctx: Ctx) {
  const gradient = ctx.createLinearGradient(0, WASH.start, 0, WASH.white);
  const span = WASH.white - WASH.start;
  gradient.addColorStop(0, rgba(ORANGE, 0));
  gradient.addColorStop(
    (WASH.peak - WASH.start) / span,
    rgba(ORANGE, WASH.peakOpacity),
  );
  gradient.addColorStop(1, WHITE);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, WASH.start, COVER.width, span);
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, WASH.white, COVER.width, COVER.height - WASH.white);
}

/** Contain-fits a logo inside a white disc with an orange ring. */
function drawLogo(ctx: Ctx, logo: LoadedImage, cx: number, cy: number) {
  const radius = SEAL_SIZE / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - LOGO_RING / 2, 0, FULL_TURN);
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = LOGO_RING;
  ctx.strokeStyle = ORANGE;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius - LOGO_RING, 0, FULL_TURN);
  ctx.clip();
  const box = (radius - LOGO_RING - LOGO_INSET) * 2;
  const scale = Math.min(box / logo.width, box / logo.height);
  const width = logo.width * scale;
  const height = logo.height * scale;
  ctx.drawImage(logo.image, cx - width / 2, cy - height / 2, width, height);
  ctx.restore();
}

function drawLogos(ctx: Ctx, logos: LoadedImage[]) {
  const shown = logos.slice(0, MAX_LOGOS);
  const span = shown.length * SEAL_SIZE + (shown.length - 1) * LOGO_GAP;
  shown.forEach((logo, i) => {
    const cx =
      (COVER.width - span) / 2 + SEAL_SIZE / 2 + i * (SEAL_SIZE + LOGO_GAP);
    drawLogo(ctx, logo, cx, LOGO_CENTER_Y);
  });
}

function drawTitle(ctx: Ctx, title: string, family: string) {
  const font = (size: number) => `bold ${size}px ${family}`;
  const { fontSize, lines } = fitText(
    title.trim(),
    TITLE_BOX,
    TITLE_SIZES,
    TITLE_LINE_HEIGHT,
    measurer(ctx, font),
  );
  const lineHeight = fontSize * TITLE_LINE_HEIGHT;
  const top = TITLE_BOX.y + (TITLE_BOX.height - lines.length * lineHeight) / 2;
  ctx.save();
  ctx.font = font(fontSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = WHITE;
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  const offset = capCentre(ctx);
  lines.forEach((line, i) => {
    const centre = top + lineHeight * (i + 0.5);
    ctx.fillText(line, TITLE_BOX.x + TITLE_BOX.width / 2, centre + offset);
  });
  ctx.restore();
}

function drawLabel(ctx: Ctx, label: string, date: string, family: string) {
  const { x, y, height, fontSize, paddingX, dateGap } = LABEL;
  const middle = y + height / 2;
  let cursor = x;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (label.trim()) {
    ctx.font = `italic bold ${fontSize}px ${family}`;
    const width = ctx.measureText(label.trim()).width + paddingX * 2;
    ctx.fillStyle = BLACK;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = WHITE;
    ctx.fillText(label.trim(), x + paddingX, middle + capCentre(ctx));
    cursor = x + width + dateGap;
  }
  if (date.trim()) {
    ctx.font = `bold ${fontSize}px ${family}`;
    ctx.fillStyle = NAVY;
    ctx.fillText(date.trim(), cursor, middle + capCentre(ctx));
  }
  ctx.restore();
}

function drawSummary(ctx: Ctx, summary: string, family: string) {
  if (!summary.trim()) return;
  const font = (size: number) => `bold ${size}px ${family}`;
  const { fontSize, lines } = fitText(
    summary.trim(),
    SUMMARY_BOX,
    SUMMARY_SIZES,
    SUMMARY_LINE_HEIGHT,
    measurer(ctx, font),
  );
  const lineHeight = fontSize * SUMMARY_LINE_HEIGHT;
  ctx.save();
  ctx.font = font(fontSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY;
  const offset = capCentre(ctx);
  lines.forEach((line, i) => {
    const centre = SUMMARY_BOX.y + lineHeight * (i + 0.5);
    ctx.fillText(line, SUMMARY_BOX.x, centre + offset);
  });
  ctx.restore();
}

/** Draws a footer icon in a unit circle (radius 1) centred on the origin. */
function drawIconGlyph(ctx: Ctx, icon: (typeof FOOTER_ITEMS)[number]["icon"]) {
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, FULL_TURN);
  ctx.fillStyle = NAVY;
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = WHITE;
  ctx.fillStyle = WHITE;
  if (icon === "facebook") {
    ctx.lineWidth = 0.26;
    ctx.beginPath();
    ctx.moveTo(0.1, 1.1);
    ctx.lineTo(0.1, -0.2);
    ctx.quadraticCurveTo(0.1, -0.62, 0.52, -0.62);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.3, -0.06);
    ctx.lineTo(0.46, -0.06);
    ctx.stroke();
  } else if (icon === "x") {
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.moveTo(-0.42, 0.46);
    ctx.lineTo(0.4, -0.46);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.44);
    ctx.lineTo(-0.16, -0.44);
    ctx.lineTo(0.46, 0.44);
    ctx.lineTo(0.16, 0.44);
    ctx.closePath();
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.lineJoin = "miter";
    ctx.lineWidth = 0.09;
    ctx.stroke();
  } else {
    ctx.fillRect(-0.5, -0.33, 1, 0.66);
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 0.09;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.3);
    ctx.lineTo(0, 0.06);
    ctx.lineTo(0.46, -0.3);
    ctx.stroke();
  }
}

/** The white contact strip: Facebook, X and email, centred as a group. */
export function drawFooter(ctx: Ctx, y: number, fonts: Fonts): void {
  ctx.save();
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, y, SQUARE, FOOTER_HEIGHT);
  ctx.font = `bold ${FOOTER_FONT_SIZE}px ${fonts.body}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const widths = FOOTER_ITEMS.map(
    (item) =>
      FOOTER_ICON_SIZE + FOOTER_ICON_GAP + ctx.measureText(item.text).width,
  );
  const total =
    widths.reduce((sum, w) => sum + w, 0) +
    FOOTER_ITEM_GAP * (FOOTER_ITEMS.length - 1);
  const middle = y + FOOTER_HEIGHT / 2;
  const baseline = middle + capCentre(ctx);
  let x = (SQUARE - total) / 2;
  FOOTER_ITEMS.forEach((item, i) => {
    const radius = FOOTER_ICON_SIZE / 2;
    ctx.save();
    ctx.translate(x + radius, middle);
    ctx.scale(radius, radius);
    drawIconGlyph(ctx, item.icon);
    ctx.restore();
    ctx.fillStyle = NAVY;
    ctx.fillText(item.text, x + FOOTER_ICON_SIZE + FOOTER_ICON_GAP, baseline);
    x += widths[i] + FOOTER_ITEM_GAP;
  });
  ctx.restore();
}

/** Draws the full 940×1880 cover; empty slots stay navy. */
export function drawCover(ctx: Ctx, input: CoverInput, fonts: Fonts): void {
  ctx.save();
  prepare(ctx);
  drawCollage(ctx, input);
  drawWave(ctx);
  drawLogos(ctx, input.logos);
  drawTitle(ctx, input.title, fonts.display);
  drawWash(ctx);
  drawLabel(ctx, input.label, input.date, fonts.body);
  drawSummary(ctx, input.summary, fonts.body);
  drawFooter(ctx, COVER.height - FOOTER_HEIGHT, fonts);
  ctx.restore();
}

/** A 940×940 photo image: the photo cover-fits the area above the footer. */
export function drawSquare(ctx: Ctx, image: LoadedImage, fonts: Fonts): void {
  const area = { x: 0, y: 0, width: SQUARE, height: SQUARE - FOOTER_HEIGHT };
  ctx.save();
  prepare(ctx);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, SQUARE, SQUARE);
  drawPhoto(ctx, image, area, CENTERED);
  drawFooter(ctx, area.height, fonts);
  ctx.restore();
}
