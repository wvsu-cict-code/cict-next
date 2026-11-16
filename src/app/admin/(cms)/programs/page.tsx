import { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import PageHeader, {
  Card,
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";

export const metadata: Metadata = {
  title: "Programs",
};

export default async function AdminProgramsPage() {
  const { supabase } = await requireAdmin();
  const { data: programs, error } = await supabase
    .from("programs")
    .select("id, code, name, logo_url, sort_order")
    .order("sort_order")
    .order("code");

  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Programs"
        description="Degree programs shown on the home page and the Programs page."
        actions={
          <PrimaryLink href="/admin/programs/new">New program</PrimaryLink>
        }
      />

      {programs.length === 0 ? (
        <EmptyState
          title="No programs yet."
          action={
            <PrimaryLink href="/admin/programs/new">New program</PrimaryLink>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <li key={program.id}>
              <Link
                href={`/admin/programs/${program.id}`}
                className="group block h-full"
              >
                <Card className="group-hover:border-theme-red/40 flex h-full items-center gap-4 transition-colors">
                  <span className="bg-paper flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                    {program.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={program.logo_url}
                        alt=""
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <Icon
                        name="programs"
                        className="text-ink-soft/50 h-6 w-6"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-major text-ink group-hover:text-theme-red block text-xl leading-none">
                      {program.code}
                    </span>
                    <span className="text-ink-soft mt-1.5 block text-sm leading-snug">
                      {program.name}
                    </span>
                  </span>
                  <span className="text-ink-soft/70 shrink-0 text-xs">
                    #{program.sort_order}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
