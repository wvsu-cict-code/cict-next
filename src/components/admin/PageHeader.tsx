import Link from "next/link";
import { Icon, type IconName } from "@/components/admin/icons";

// Shared CMS styles. They use the public site's colors (theme-red, ink,
// navy) so the CMS and the site read as one product.

const buttonBase =
  "ease-draw inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60";

export const buttonClass = {
  primary: `${buttonBase} bg-theme-red text-white hover:bg-accent-deep`,
  secondary: `${buttonBase} border border-rule bg-white text-ink hover:border-ink/40 hover:bg-paper`,
  danger: `${buttonBase} border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50`,
};

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
    <header className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="text-ink-soft hover:text-theme-red mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <Icon name="back" className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-ink text-3xl leading-tight font-medium md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-ink-soft mt-2 max-w-[60ch] text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}

export function PrimaryLink({
  href,
  icon = "plus",
  children,
}: {
  href: string;
  icon?: IconName | null;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass.primary}>
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  icon,
  external = false,
  children,
}: {
  href: string;
  icon?: IconName;
  external?: boolean;
  children: React.ReactNode;
}) {
  const content = (
    <>
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
      {external && <Icon name="external" className="h-3.5 w-3.5 opacity-60" />}
    </>
  );
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass.secondary}
    >
      {content}
    </a>
  ) : (
    <Link href={href} className={buttonClass.secondary}>
      {content}
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
    <div
      className={`border-rule/70 rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(16,32,51,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

/** A titled group of fields inside a CMS form. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-ink text-lg font-medium">{title}</h2>
        {description && (
          <p className="text-ink-soft mt-1 text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </Card>
  );
}

/** Shown in a list when it has nothing in it yet. */
export function EmptyState({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-rule flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
      <p className="text-ink-soft text-sm">{title}</p>
      {action}
    </div>
  );
}
