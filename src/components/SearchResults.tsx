"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { PageHeader, container } from "@/components/PageHeader";
import { loadSearch } from "@/lib/cms/siteContent";
import { useContent } from "@/lib/cms/useContent";
import {
  searchHits,
  searchPreview,
  searchTerms,
  type SearchHit,
  type SearchKind,
} from "@/lib/search/search";

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: "Program", label: "Programs" },
  { kind: "Article", label: "Articles" },
  { kind: "Faculty", label: "Faculty" },
  { kind: "Page", label: "Pages" },
];

export function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const content = useContent("search", loadSearch);
  const terms = searchTerms(query);
  const tooShort = query.trim().length > 0 && terms.length === 0;
  const matches =
    content.status === "ready" && !tooShort
      ? searchHits(content.data, query)
      : [];

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Search"
        title="Search the college site"
        intro="Articles, programs, and faculty."
      >
        <SearchForm query={query} />
      </PageHeader>
      <div className={`${container} pt-4 pb-16 md:pb-20`}>
        <div className="max-w-3xl">
          {query.length === 0 ? (
            <p className="text-ink-soft mt-8 text-base">
              Type at least two letters, then search.
            </p>
          ) : tooShort ? (
            <p className="text-ink-soft mt-8 text-base">
              Type at least two letters.
            </p>
          ) : content.status === "error" ? (
            <ContentError onRetry={content.retry} />
          ) : content.status === "loading" ? (
            <div className="mt-8 grid gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <ContentPlaceholder key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <p className="text-ink-soft mt-8 text-base">
              Nothing matched {query}.
            </p>
          ) : (
            <div className="mt-10 grid gap-10">
              {GROUPS.map((group) => {
                const items = matches.filter((hit) => hit.kind === group.kind);
                if (items.length === 0) return null;
                return (
                  <section key={group.kind}>
                    <h2 className="text-ink text-2xl font-medium">
                      {group.label}
                    </h2>
                    <ul className="divide-rule border-rule mt-4 divide-y border-y">
                      {items.map((hit) => (
                        <li key={hit.id}>
                          <ResultLink hit={hit} query={query} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchForm({ query }: { query: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(query);
  const [synced, setSynced] = useState(query);
  if (query !== synced) {
    setSynced(query);
    setDraft(query);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="mt-8 flex max-w-xl gap-2"
    >
      <label htmlFor="search-query" className="sr-only">
        Search the site
      </label>
      <input
        id="search-query"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search articles, programs, and faculty"
        className="text-ink focus:ring-orange-light min-h-11 min-w-0 flex-1 rounded-full border border-transparent bg-white px-4 text-base outline-none focus:ring-2"
      />
      <button
        type="submit"
        className="ease-draw bg-theme-red hover:bg-accent-deep min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold text-white transition-colors duration-200"
      >
        Search
      </button>
    </form>
  );
}

function ResultLink({ hit, query }: { hit: SearchHit; query: string }) {
  return (
    <Link href={hit.href} className="group block py-4">
      <span className="text-theme-red text-[11px] font-semibold tracking-[0.14em] uppercase">
        {hit.kind}
      </span>
      <span className="text-ink group-hover:text-theme-red mt-1 block text-lg leading-snug font-medium">
        {hit.title}
      </span>
      <span className="text-ink-soft mt-1 block text-sm leading-relaxed">
        {searchPreview(hit, query)}
      </span>
    </Link>
  );
}
