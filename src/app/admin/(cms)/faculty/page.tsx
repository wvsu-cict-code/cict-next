import { Metadata } from "next";
import Link from "next/link";
import PageHeader, { Card, PrimaryLink } from "@/components/admin/PageHeader";
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
            <Link
              href="/admin/faculty/departments/new"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
            >
              New department
            </Link>
            <PrimaryLink href="/admin/faculty/members/new">
              New member
            </PrimaryLink>
          </>
        }
      />

      <div className="space-y-6">
        {departments.length === 0 && (
          <p className="text-sm text-neutral-500">No departments yet.</p>
        )}
        {departments.map((dept) => (
          <Card key={dept.slug} className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-6 py-4">
              <h2 className="text-xl font-medium">{dept.name}</h2>
              <div className="flex gap-4 text-sm">
                <Link
                  href={`/admin/faculty/members/new?department=${dept.slug}`}
                  className="text-orange-dark hover:underline"
                >
                  + Add member
                </Link>
                <Link
                  href={`/admin/faculty/departments/${dept.slug}`}
                  className="text-neutral-500 hover:text-neutral-900"
                >
                  Edit department
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-neutral-100">
              {dept.faculty_members.length === 0 && (
                <li className="px-6 py-4 text-sm text-neutral-500">
                  No members yet.
                </li>
              )}
              {dept.faculty_members.map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/admin/faculty/members/${member.id}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.image_url || PLACEHOLDER_IMAGE}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {member.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
