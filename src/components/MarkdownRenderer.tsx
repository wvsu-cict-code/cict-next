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
          <h1 className="mt-6 mb-4 text-3xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 mb-3 text-2xl font-bold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-5 mb-3 text-xl font-bold">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-orange-dark hover:text-orange-light underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 list-disc space-y-1 pl-6 text-gray-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 list-decimal space-y-1 pl-6 text-gray-700">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-orange-light mb-4 border-l-4 pl-4 text-gray-600 italic">
            {children}
          </blockquote>
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
              className="mx-auto my-4 block h-auto w-full rounded-lg shadow-md"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
