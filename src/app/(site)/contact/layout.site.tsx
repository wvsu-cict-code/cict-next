import type { Metadata } from 'next';

// --- STATIC SEO METADATA ---
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the College of Information and Communications Technology at West Visayas State University. Find our address, contact information, office hours, and FAQs.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact',
    description: 'Get in touch with the College of Information and Communications Technology at West Visayas State University. Find our address, contact information, office hours, and FAQs.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}