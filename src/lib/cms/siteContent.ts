import {
  fetchDepartmentWithFaculty,
  fetchDepartments,
  fetchDepartmentsWithFaculty,
  fetchFeaturedPost,
  fetchPrograms,
  fetchPublishedEvents,
  fetchPublishedPosts,
  type ContentClient,
} from "@/lib/cms/content";
import { prefetchContent, rememberContent } from "@/lib/cms/useContent";
import { toNewsArticle } from "@/lib/news";
import { buildSearchHits } from "@/lib/search/search";

/** How many stories the home page lists beside the featured post. */
export const HOME_NEWS_LIMIT = 4;

/** Programs for the home page and the programs index. Also fills each detail page. */
export async function loadPrograms(client: ContentClient) {
  const programs = await fetchPrograms(client);
  for (const program of programs) {
    rememberContent(`program:${program.id}`, program);
  }
  return programs;
}

/** Featured story and the newest posts for the home page. */
export async function loadHomeNews(client: ContentClient) {
  const [featuredPost, latestPosts] = await Promise.all([
    fetchFeaturedPost(client),
    fetchPublishedPosts(client, { limit: HOME_NEWS_LIMIT + 1 }),
  ]);

  for (const post of [featuredPost, ...latestPosts]) {
    if (post?.slug) rememberContent(`post:${post.slug}`, post);
  }
  return { featuredPost, latestPosts };
}

/** News and announcement lists. Also fills each article page. */
export async function loadNewsAnnouncements(client: ContentClient) {
  const [announcements, news] = await Promise.all([
    fetchPublishedPosts(client, {
      category: "announcement" as const,
      limit: 10,
    }),
    fetchPublishedPosts(client, { category: "news" as const }),
  ]);

  for (const post of [...announcements, ...news]) {
    if (post.slug) rememberContent(`post:${post.slug}`, post);
  }

  return {
    announcements: announcements.map(toNewsArticle),
    newsArticles: news.map(toNewsArticle),
  };
}

/** Published events, oldest first. Also fills each event page. */
export async function loadEvents(client: ContentClient) {
  const events = await fetchPublishedEvents(client);
  for (const event of events) {
    rememberContent(`event:${event.slug}`, event);
  }
  return events;
}

/** Articles, events, programs, faculty, and the main pages, for site search. */
export async function loadSearch(client: ContentClient) {
  const [posts, events, programs, departments] = await Promise.all([
    fetchPublishedPosts(client),
    loadEvents(client),
    fetchPrograms(client),
    fetchDepartmentsWithFaculty(client),
  ]);

  for (const post of posts) {
    if (post.slug) rememberContent(`post:${post.slug}`, post);
  }
  for (const program of programs) {
    rememberContent(`program:${program.id}`, program);
  }
  for (const entry of departments) {
    rememberContent(`department:${entry.department.slug}`, {
      department: entry.department,
      faculty: entry.faculty.map((person) => person.member),
    });
  }

  return buildSearchHits({
    posts,
    events,
    programs,
    departments: departments.map((entry) => ({
      slug: entry.department.slug,
      name: entry.department.name,
      faculty: entry.faculty,
    })),
  });
}

/**
 * Department pins for the directory. Faculty for each department loads in
 * the background so opening one doesn't start from an empty page.
 */
export async function loadDepartments(client: ContentClient) {
  const departments = await fetchDepartments(client);
  for (const department of departments) {
    void prefetchContent(`department:${department.slug}`, (next) =>
      fetchDepartmentWithFaculty(next, department.slug),
    ).catch(() => {});
  }
  return departments;
}
