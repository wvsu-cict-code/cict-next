import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-8 space-y-2">
      {backHref && (
        <Link
          href={backHref}
          className="hover:text-orange-dark text-sm text-neutral-500"
        >
          ← {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-medium">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
    </header>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-orange-dark hover:bg-orange-light rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
