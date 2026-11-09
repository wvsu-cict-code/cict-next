import { eventHref, formatEventWhen } from "@/lib/events";
import { brochureFor } from "@/lib/programs/brochure";
import { newsHref } from "@/lib/news";

export type SearchKind = "Article" | "Event" | "Program" | "Faculty" | "Page";

export type SearchHit = {
  id: string;
  kind: SearchKind;
  title: string;
  detail: string;
  href: string;
  /** Plain text the query is matched against. */
  text: string;
};

const PAGES: SearchHit[] = [
  {
    id: "page:about",
    kind: "Page",
    title: "About",
    detail: "History, mission, and vision of the college.",
    href: "/about",
    text: "Innovative education for a digital tomorrow. Founded in 2002 under BOR Resolution No. 34, the College of Information and Communications Technology began as the Institute of Information and Communications Technology. Mission and vision. Western Visayas.",
  },
  {
    id: "page:admissions",
    kind: "Page",
    title: "Admissions",
    detail: "How to apply: requirements, steps, and key dates.",
    href: "/admissions",
    text: "Admissions. How to apply, enroll, or shift to a CICT program. Requirements, application steps, admission test, key dates, scholarships, and financial aid.",
  },
  {
    id: "page:contact",
    kind: "Page",
    title: "Contact",
    detail: "Write to the CICT office about programs, visits, and enrollment.",
    href: "/contact",
    text: "College contact information. West Visayas State University, La Paz, Iloilo City. Office hours, email cict@wvsu.edu.ph, phone, admission, enrollment, and visits.",
  },
  {
    id: "page:programs",
    kind: "Page",
    title: "Programs",
    detail: "Undergraduate and graduate degrees taught at the college.",
    href: "/programs",
    text: "Programs and curriculum. Undergraduate and graduate degree programs and courses offered at the college.",
  },
  {
    id: "page:news",
    kind: "Page",
    title: "News and announcements",
    detail: "College updates, events, and announcements.",
    href: "/news-announcements",
    text: "News and announcements. College updates, events, and news articles.",
  },
  {
    id: "page:events",
    kind: "Page",
    title: "Events",
    detail: "Upcoming events and academic calendar dates.",
    href: "/events",
    text: "Events and academic calendar. Upcoming college events, activities, seminars, enrollment periods, and important dates.",
  },
  {
    id: "page:faculty",
    kind: "Page",
    title: "Faculty",
    detail: "Departments and faculty profiles.",
    href: "/faculty-profiles",
    text: "Faculty directory. Departments and faculty profiles.",
  },
];

export type SearchPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: string;
};

export type SearchEvent = {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
};

export type SearchProgram = {
  id: string;
  code: string;
  name: string;
  description: string;
  objectives: string;
};

export type SearchDepartment = {
  slug: string;
  name: string;
  faculty: { id: string; name: string; title: string; description: string }[];
};

export function buildSearchHits(input: {
  posts: SearchPost[];
  events: SearchEvent[];
  programs: SearchProgram[];
  departments: SearchDepartment[];
}): SearchHit[] {
  const articles: SearchHit[] = input.posts.map((post) => ({
    id: `post:${post.slug}`,
    kind: "Article",
    title: post.title,
    detail: post.excerpt?.trim() || labelFor(post.category),
    href: newsHref(post.slug),
    text: [post.title, post.excerpt, post.body, post.category]
      .filter(Boolean)
      .join(" "),
  }));

  const events: SearchHit[] = input.events.map((event) => ({
    id: `event:${event.slug}`,
    kind: "Event",
    title: event.title,
    detail: formatEventWhen(event),
    href: eventHref(event.slug),
    text: [event.title, event.summary, event.location, event.body, "event"]
      .filter(Boolean)
      .join(" "),
  }));

  const programs: SearchHit[] = input.programs.map((program) => {
    const brochure = brochureFor(program.code);
    const subjects =
      brochure?.groups
        .flatMap((group) => [
          group.label,
          group.note,
          ...group.subjects.flatMap((subject) => [subject.code, subject.title]),
        ])
        .filter(Boolean)
        .join(" ") ?? "";
    return {
      id: `program:${program.id}`,
      kind: "Program" as const,
      title: program.name || program.code,
      detail: program.code,
      href: `/programs/${program.id}`,
      text: [
        program.code,
        program.name,
        brochure?.description ?? program.description,
        brochure?.lead,
        brochure?.highlight,
        program.objectives,
        subjects,
      ]
        .filter(Boolean)
        .join(" "),
    };
  });

  const faculty: SearchHit[] = input.departments.flatMap((department) => {
    const office: SearchHit = {
      id: `department:${department.slug}`,
      kind: "Faculty",
      title: department.name,
      detail: "Department",
      href: `/faculty-profiles/${department.slug}`,
      text: `${department.name} department`,
    };
    const people = department.faculty.map((member) => ({
      id: `faculty:${member.id}`,
      kind: "Faculty" as const,
      title: member.name,
      detail: [member.title, department.name].filter(Boolean).join(", "),
      href: `/faculty-profiles/${department.slug}`,
      text: [member.name, member.title, member.description, department.name]
        .filter(Boolean)
        .join(" "),
    }));
    return [office, ...people];
  });

  return [...programs, ...articles, ...events, ...faculty, ...PAGES];
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "or",
  "to",
  "for",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
]);

/** Content words only. Filler words and one-letter tokens are left out. */
export function searchTerms(query: string) {
  return normalize(query)
    .split(/\s+/)
    .map((term) => term.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""))
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term));
}

/** Matches every content word. A query with none matches nothing. */
export function searchHits(hits: SearchHit[], query: string) {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  return hits
    .map((hit) => {
      const title = normalize(hit.title);
      const detail = normalize(hit.detail);
      const text = normalize(`${hit.title} ${hit.text}`);
      if (!terms.every((term) => text.includes(term))) return null;
      const score = terms.reduce((sum, term) => {
        if (title.includes(term)) return sum + 3;
        if (detail.includes(term)) return sum + 2;
        return sum + 1;
      }, 0);
      return { hit, score };
    })
    .filter(
      (match): match is { hit: SearchHit; score: number } => match !== null,
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.hit.kind.localeCompare(b.hit.kind) ||
        a.hit.title.localeCompare(b.hit.title),
    )
    .map((match) => match.hit);
}

export function searchPreview(hit: SearchHit, query: string) {
  const terms = searchTerms(query);
  const title = normalize(hit.title);
  if (terms.length > 0 && terms.every((term) => title.includes(term))) {
    return hit.detail;
  }
  return snippet(hit.text, terms) || hit.detail;
}

function snippet(text: string, terms: string[]) {
  const plain = text
    .replace(/[^\p{L}\p{N}\s.,'@-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  const lower = normalize(plain);
  const at = terms
    .map((term) => lower.indexOf(term))
    .find((index) => index >= 0);
  let start = Math.max(0, (at ?? 0) - 48);
  if (start > 0) {
    const previous = plain.lastIndexOf(" ", start);
    start = previous === -1 ? 0 : previous + 1;
  }
  let end = Math.min(plain.length, start + 160);
  if (end < plain.length) {
    const next = plain.lastIndexOf(" ", end);
    if (next > start) end = next;
  }
  const slice = plain.slice(start, end).trim();
  const lead = start > 0 ? "... " : "";
  const tail = end < plain.length ? " ..." : "";
  return `${lead}${slice}${tail}`;
}

function labelFor(category: string) {
  if (category === "announcement") return "Announcement";
  if (category === "news") return "News";
  return category;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}
