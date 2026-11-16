"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { StudentWork } from "@/lib/cms/content";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import { container } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useContent } from "@/lib/cms/useContent";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_SINGULAR,
  type Category,
} from "@/lib/museum/categories";
import { fetchExhibits } from "@/lib/museum/queries";
import { useSaved } from "@/lib/museum/saved";
import { ExhibitCard } from "./ExhibitCard";

const PAGE = 12;

type Filter = "all" | "saved" | Category;

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function filterFromHash(): Filter {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return "all";
  const category = new URLSearchParams(hash.slice(queryIndex + 1)).get(
    "category",
  );
  return category && isCategory(category) ? category : "all";
}

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function emptyCopy(filter: Filter, search: string): string {
  if (search) return "No exhibits match that search.";
  if (filter === "saved") return "You haven't saved any exhibits.";
  if (filter === "all") return "No exhibits yet.";
  return `No ${CATEGORY_SINGULAR[filter].toLowerCase()} works yet.`;
}

const chipClass =
  "h-auto min-h-11 flex-none rounded-full px-3 first:rounded-full last:rounded-full data-[state=on]:bg-theme-red! data-[state=on]:text-white! data-[state=on]:hover:bg-theme-red! data-[state=on]:hover:text-white!";

/** Approved works, filtered by category, saved ids, or a debounced search. */
export function BrowseExhibits({ onOpen }: { onOpen(workId: string): void }) {
  const saved = useSaved();
  const hashFilter = useSyncExternalStore(
    subscribeHash,
    filterFromHash,
    () => "all" as const,
  );
  const [chosen, setChosen] = useState<{
    filter: Filter;
    hash: Filter;
  } | null>(null);
  const filter =
    chosen !== null && chosen.hash === hashFilter ? chosen.filter : hashFilter;

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = search.trim();
  const scope = `${filter}:${trimmed}`;
  const [page, setPage] = useState({ scope, limit: PAGE });
  const pageLimit = page.scope === scope ? page.limit : PAGE;

  const ids = filter === "saved" ? saved.ids : undefined;
  const categories = isCategory(filter) ? [filter] : undefined;
  const key = `exhibits:${filter}:${trimmed}:${pageLimit}:${ids?.join(",") ?? ""}`;
  const result = useContent(key, (client) =>
    fetchExhibits(client, {
      offset: 0,
      limit: pageLimit,
      ...(categories ? { categories } : {}),
      ...(trimmed ? { search: trimmed } : {}),
      ...(ids ? { ids } : {}),
    }),
  );

  const scopeKey = `${filter}:${trimmed}:${ids?.join(",") ?? ""}`;
  const ready = result.status === "ready" ? result.data : null;
  const [shown, setShown] = useState<{
    scope: string;
    works: StudentWork[];
    total: number;
  } | null>(null);
  useEffect(() => {
    if (!ready) return;
    setShown({ scope: scopeKey, works: ready.works, total: ready.total });
  }, [ready, scopeKey]);
  const visible = ready ?? (shown?.scope === scopeKey ? shown : null);
  const works = visible?.works ?? [];
  const total = visible?.total ?? 0;

  return (
    <div className={`${container} py-16 md:py-20`}>
      <h2 className="text-ink text-3xl leading-tight font-medium md:text-4xl">
        Browse Exhibits
      </h2>
      <div className="mt-6 flex flex-col gap-4">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value) => {
            if (!value) return;
            setChosen({ filter: value as Filter, hash: hashFilter });
          }}
          aria-label="Exhibit filters"
          className="flex w-full flex-wrap gap-2"
        >
          <ToggleGroupItem value="all" className={chipClass}>
            All
          </ToggleGroupItem>
          {CATEGORIES.map((category) => (
            <ToggleGroupItem
              key={category}
              value={category}
              className={chipClass}
            >
              {CATEGORY_LABELS[category]}
            </ToggleGroupItem>
          ))}
          <ToggleGroupItem value="saved" className={chipClass}>
            Saved
          </ToggleGroupItem>
        </ToggleGroup>
        <Input
          type="search"
          aria-label="Search exhibits"
          value={query}
          placeholder="Search by title or student"
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 max-w-md rounded-full px-4"
        />
      </div>

      {result.status === "loading" && works.length === 0 ? (
        <ContentPlaceholder className="mt-8 h-48" />
      ) : null}
      {result.status === "error" ? (
        <ContentError onRetry={result.retry} />
      ) : null}
      {result.status === "ready" && works.length === 0 ? (
        <p className="text-ink-soft mt-10 text-center">
          {emptyCopy(filter, trimmed)}
        </p>
      ) : null}
      {works.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {works.map((work) => (
            <li key={work.id}>
              <ExhibitCard work={work} onOpen={() => onOpen(work.id)} />
            </li>
          ))}
        </ul>
      ) : null}
      {result.status === "ready" && works.length < total ? (
        <button
          type="button"
          onClick={() => setPage({ scope, limit: pageLimit + PAGE })}
          className="border-rule text-ink hover:border-accent mx-auto mt-8 flex min-h-11 w-fit items-center rounded-full border px-5 text-sm font-semibold"
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
