import FacultyDepartmentPage from "@/components/faculty/FacultyDepartmentPage";
import { PLACEHOLDER_SEGMENT } from "@/lib/routes";

// The school site exports one template page for every department (see
// .htaccess); the department itself loads in the browser.
export function generateStaticParams() {
  return [{ dept: PLACEHOLDER_SEGMENT }];
}

export default function Page() {
  return <FacultyDepartmentPage />;
}
