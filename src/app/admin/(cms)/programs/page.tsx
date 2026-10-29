import { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Card, PrimaryLink } from "@/components/admin/PageHeader";
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.length === 0 && (
          <p className="text-sm text-neutral-500">No programs yet.</p>
        )}
        {programs.map((program) => (
          <Link
            key={program.id}
            href={`/admin/programs/${program.id}`}
            className="group"
          >
            <Card className="flex h-full items-center gap-4 transition-shadow group-hover:shadow-md">
              {program.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={program.logo_url}
                  alt=""
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-neutral-200" />
              )}
              <div>
                <p className="font-major text-xl">{program.code}</p>
                <p className="text-sm text-neutral-500">{program.name}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
