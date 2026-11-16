/**
 * The CMS edits a program's careers as one per line. Blank lines, leading
 * bullets and repeats (ignoring case) are dropped.
 */
export function parseCareers(text: string): string[] {
  const seen = new Set<string>();
  const careers: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    const career = line.replace(/^\s*[-•*]\s*/, "").trim();
    const key = career.toLowerCase();
    if (!career || seen.has(key)) continue;
    seen.add(key);
    careers.push(career);
  }

  return careers;
}
