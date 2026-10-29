import ProgramDetails from "@/components/ProgramDetails";
import { PLACEHOLDER_SEGMENT } from "@/lib/routes";

// The school site exports one template page for every program (see
// .htaccess); the program itself loads in the browser.
export function generateStaticParams() {
    return [{ id: PLACEHOLDER_SEGMENT }];
}

export default function ProgramDetailsPage() {
    return <ProgramDetails />;
}
