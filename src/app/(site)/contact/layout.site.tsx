import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// --- STATIC SEO METADATA ---
export const metadata: Metadata = {
  title: "Contact",
  ...pageMetadata({
    title: "Contact | WVSU CICT",
    description:
      "Get in touch with the College of Information and Communications Technology at West Visayas State University. Find our address, contact information, office hours, and FAQs.",
    path: "/contact",
  }),
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
