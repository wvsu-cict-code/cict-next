import type { ReactNode } from "react";
import { container } from "@/components/PageHeader";

/** Centered card shared by the account pages. */
export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main id="content" className="bg-surface-2 grow py-12 md:py-20">
      <div className={container}>
        <div className="border-rule bg-card text-card-foreground mx-auto w-full max-w-md rounded-2xl border p-6 md:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {intro ? <p className="mt-2 text-sm">{intro}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  );
}
