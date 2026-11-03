import type { Rect } from "./layouts";

export type Measure = (text: string, fontSize: number) => number;

const ELLIPSIS = "…";
const SUMMARY_MAX = 200;

/** Splits a word into chunks that each fit maxWidth. */
function breakWord(
  word: string,
  maxWidth: number,
  fontSize: number,
  measure: Measure,
) {
  const chunks: string[] = [];
  let current = "";
  for (const ch of word) {
    if (current && measure(current + ch, fontSize) > maxWidth) {
      chunks.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function wrapLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: Measure,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, fontSize) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (measure(word, fontSize) <= maxWidth) {
        line = word;
      } else {
        const chunks = breakWord(word, maxWidth, fontSize, measure);
        line = chunks.pop() ?? "";
        lines.push(...chunks);
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function withEllipsis(
  line: string,
  maxWidth: number,
  fontSize: number,
  measure: Measure,
) {
  let text = line.trimEnd();
  while (text && measure(text + ELLIPSIS, fontSize) > maxWidth) {
    text = text.slice(0, -1).trimEnd();
  }
  return text + ELLIPSIS;
}

export function fitText(
  text: string,
  box: Rect,
  sizes: number[],
  lineHeight: number,
  measure: Measure,
): { fontSize: number; lines: string[] } {
  const fits = (size: number, count: number) =>
    count * size * lineHeight <= box.height;
  for (const size of sizes) {
    const lines = wrapLines(text, box.width, size, measure);
    if (fits(size, lines.length)) return { fontSize: size, lines };
  }
  const size = sizes[sizes.length - 1];
  const lines = wrapLines(text, box.width, size, measure);
  const maxLines = Math.max(1, Math.floor(box.height / (size * lineHeight)));
  const kept = lines.slice(0, maxLines);
  kept[kept.length - 1] = withEllipsis(
    kept[kept.length - 1],
    box.width,
    size,
    measure,
  );
  return { fontSize: size, lines: kept };
}

export function markdownToPlain(md: string): string {
  return md
    .replace(/\r\n?/g, "\n")
    .replace(/```[^\n]*\n([\s\S]*?)```/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^ {0,3}#{1,6}\s+/gm, "")
    .replace(/^ {0,3}>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function summaryFor(excerpt: string | null, body: string): string {
  const given = excerpt?.trim();
  if (given) return given;
  const plain = markdownToPlain(body).replace(/\s+/g, " ");
  if (plain.length <= SUMMARY_MAX) return plain;
  const cut = plain.slice(0, SUMMARY_MAX);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : cut).trimEnd() + ELLIPSIS;
}
