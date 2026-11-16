import NewsArticle from "@/components/NewsArticle";
import { PLACEHOLDER_SEGMENT } from "@/lib/routes";

// The school site exports one template page for every post (see .htaccess);
// the post itself loads in the browser.
export function generateStaticParams() {
  return [{ slug: PLACEHOLDER_SEGMENT }];
}

export default function NewsArticlePage() {
  return <NewsArticle />;
}
