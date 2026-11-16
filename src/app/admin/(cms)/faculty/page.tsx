import { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import PageHeader, {
  EmptyState,
  PrimaryLink,
  SecondaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { PLACEHOLDER_IMAGE } from "@/lib/faculty";

export const metadata: Metadata = {
  title: "Faculty",
};

export default async function AdminFacultyPage() {
  const { supabase } = await requireAdmin();
  const { data: departments, error } = await supabase
    .from("departments")
    .select(
      "slug, name, faculty_members(id, name, title, image_url, sort_order)",
    )
    .order("sort_order")
    .order("name")
    .order("sort_order", { referencedTable: "faculty_members" });

  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Faculty"
        description="Departments and faculty members shown in the Faculty Directory."
        actions={
          <>
            <SecondaryLink href="/admin/faculty/departments/new" icon="plus">
              New department
            </SecondaryLink>
            <PrimaryLink href="/admin/faculty/members/new">
              New member
            </PrimaryLink>
          </>
        }
      />

      {departments.length === 0 ? (
        <EmptyState
          title="No departments yet."
          action={
            <PrimaryLink href="/admin/faculty/departments/new">
              New department
            </PrimaryLink>
          }
        />
      ) : (
        <>
          {/* Jump to a department; the list below is long */}
          <nav aria-label="Departments" className="mb-6 flex flex-wrap gap-2">
            {departments.map((dept) => (
              <a
                key={dept.slug}
                href={`#dept-${dept.slug}`}
                className="border-rule text-ink hover:border-theme-red/50 hover:text-theme-red inline-flex min-h-9 items-center gap-2 rounded-full border bg-white px-3 text-sm transition-colors"
              >
                {dept.name}
                <span className="text-ink-soft text-xs">
                  {dept.faculty_members.length}
                </span>
              </a>
            ))}
          </nav>

          <div className="space-y-4">
            {departments.map((dept) => (
              <details
                key={dept.slug}
                id={`dept-${dept.slug}`}
                open
                className="group/dept border-rule/70 scroll-mt-6 overflow-hidden rounded-2xl border bg-white"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-6 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <Icon
                      name="chevron"
                      className="text-ink-soft h-4 w-4 -rotate-90 transition-transform group-open/dept:rotate-0"
                    />
                    <span className="text-ink text-lg font-medium">
                      {dept.name}
                    </span>
                    <span className="bg-paper text-ink-soft rounded-full px-2 py-0.5 text-xs font-semibold">
                      {dept.faculty_members.length}
                    </span>
                  </span>
                  <span className="flex gap-1 text-sm">
                    <Link
                      href={`/admin/faculty/members/new?department=${dept.slug}`}
                      className="text-theme-red hover:bg-theme-red/5 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-semibold"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      Add member
                    </Link>
                    <Link
                      href={`/admin/faculty/departments/${dept.slug}`}
                      className="text-ink-soft hover:bg-paper hover:text-ink inline-flex min-h-9 items-center rounded-lg px-2.5"
                    >
                      Edit department
                    </Link>
                  </span>
                </summary>
                {dept.faculty_members.length === 0 ? (
                  <p className="border-rule/70 text-ink-soft border-t px-6 py-4 text-sm">
                    No members yet.
                  </p>
                ) : (
                  <ul className="border-rule/70 grid border-t md:grid-cols-2">
                    {dept.faculty_members.map((member) => (
                      <li
                        key={member.id}
                        className="border-rule/70 border-b md:odd:border-r"
                      >
                        <Link
                          href={`/admin/faculty/members/${member.id}`}
                          className="group hover:bg-paper/60 flex items-center gap-3 px-6 py-3 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.image_url || PLACEHOLDER_IMAGE}
                            alt=""
                            className="bg-paper h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                          <span className="min-w-0">
                            <span className="text-ink group-hover:text-theme-red block truncate text-sm font-semibold">
                              {member.name}
                            </span>
                            <span className="text-ink-soft block truncate text-xs">
                              {member.title || "No title"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </>
      )}
    </>
  );
}
