"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { searchTerms } from "@/lib/search/search";

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    if (searchTerms(next).length === 0) return;
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="border-rule focus-within:border-theme-red flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border bg-white py-1 pr-1 pl-4"
    >
      <label htmlFor="news-search" className="sr-only">
        Search the site
      </label>
      <input
        id="news-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search articles, programs, faculty"
        className="text-ink placeholder:text-ink-soft/70 min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="bg-theme-red hover:bg-accent-deep ease-draw inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13 13l4 4" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
