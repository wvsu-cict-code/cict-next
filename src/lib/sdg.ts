/**
 * The 17 UN Sustainable Development Goals, with their official short names
 * and colors (https://www.un.org/sustainabledevelopment/news/communications-material/).
 */
export const SDGS = [
  { number: 1, name: "No Poverty", color: "#E5243B" },
  { number: 2, name: "Zero Hunger", color: "#DDA63A" },
  { number: 3, name: "Good Health and Well-being", color: "#4C9F38" },
  { number: 4, name: "Quality Education", color: "#C5192D" },
  { number: 5, name: "Gender Equality", color: "#FF3A21" },
  { number: 6, name: "Clean Water and Sanitation", color: "#26BDE2" },
  { number: 7, name: "Affordable and Clean Energy", color: "#FCC30B" },
  { number: 8, name: "Decent Work and Economic Growth", color: "#A21942" },
  {
    number: 9,
    name: "Industry, Innovation and Infrastructure",
    color: "#FD6925",
  },
  { number: 10, name: "Reduced Inequalities", color: "#DD1367" },
  { number: 11, name: "Sustainable Cities and Communities", color: "#FD9D24" },
  {
    number: 12,
    name: "Responsible Consumption and Production",
    color: "#BF8B2E",
  },
  { number: 13, name: "Climate Action", color: "#3F7E44" },
  { number: 14, name: "Life Below Water", color: "#0A97D9" },
  { number: 15, name: "Life on Land", color: "#56C02B" },
  {
    number: 16,
    name: "Peace, Justice and Strong Institutions",
    color: "#00689D",
  },
  { number: 17, name: "Partnerships for the Goals", color: "#19486A" },
] as const;

export type Sdg = (typeof SDGS)[number];

/** The goals for a post, in goal order; unknown numbers are dropped. */
export function sdgsFor(numbers: readonly number[] | null | undefined): Sdg[] {
  const wanted = new Set(numbers ?? []);
  return SDGS.filter((goal) => wanted.has(goal.number));
}

/**
 * Goal numbers from the CMS form's `sdgs` checkboxes: valid goals only,
 * each once, in goal order.
 */
export function parseSdgs(values: readonly FormDataEntryValue[]): number[] {
  const picked = new Set(
    values
      .map((value) => (typeof value === "string" ? Number(value) : NaN))
      .filter((n) => Number.isInteger(n)),
  );
  return SDGS.map((goal) => goal.number).filter((n) => picked.has(n));
}
