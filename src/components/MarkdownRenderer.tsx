import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Raw HTML in post bodies is intentionally not rendered (no rehype-raw), so
// CMS content can't inject scripts or arbitrary markup into the site.
export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-ink mt-10 mb-4 text-3xl leading-tight font-medium">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-ink mt-10 mb-3 text-2xl leading-tight font-medium">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-ink mt-8 mb-3 text-xl leading-snug font-medium">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-ink-soft mb-5 text-base leading-relaxed md:text-lg">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="text-ink font-semibold">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-theme-red hover:text-accent-deep underline underline-offset-2"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="text-ink-soft mb-5 list-disc space-y-1.5 pl-6 text-base leading-relaxed md:text-lg">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="text-ink-soft mb-5 list-decimal space-y-1.5 pl-6 text-base leading-relaxed md:text-lg">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-theme-red text-ink mb-5 border-l-2 pl-4 text-lg leading-relaxed">
            {children}
          </blockquote>
        ),
        // Tables (schedules, fees) scroll sideways on phones instead of
        // widening the page
        table: ({ children }) => (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-base">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-rule text-ink border-b-2 px-3 py-2 font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-rule text-ink-soft border-b px-3 py-2 align-top">
            {children}
          </td>
        ),
        img: ({ src, alt }) => {
          if (!src || typeof src !== "string") return null;
          return (
            // Markdown images can point anywhere, so skip next/image's host allow-list.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              loading="lazy"
              className="my-8 block h-auto w-full rounded-2xl"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
