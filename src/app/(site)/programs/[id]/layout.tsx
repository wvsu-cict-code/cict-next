import type { Metadata } from 'next';
import { getProgram } from '@/lib/cms/queries';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

// --- DYNAMIC SEO METADATA ---
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { id } = await params;
    
    // Find the specific program based on the URL id
    const program = await getProgram(id);

    // Fallback if the URL is incorrect
    if (!program) {
        return {
            title: "Program Not Found",
            description: "The requested program could not be found.",
        };
    }

    // Grab the first 160 characters for the meta description
    const metaDescription = program.description.substring(0, 160) + "...";

    return {
        title: `${program.name}`,
        description: metaDescription,
        alternates: {
            // Points to the exact URL of this specific program
            canonical: `/programs/${id}`, 
        },
        openGraph: {
            title: `${program.code} - ${program.name}`,
            description: metaDescription,
            // Uses the program's specific icon/logo for social sharing previews
            images: program.logo_url ? [program.logo_url] : [], 
            type: "website",
        },
    };
}

export default function ProgramDetailsLayout({ children }: LayoutProps) {
    // This wraps your team's dynamic program page without modifying it
    return <>{children}</>;
}