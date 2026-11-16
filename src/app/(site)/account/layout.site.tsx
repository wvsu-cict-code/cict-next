import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Account pages are for signed-in use only: kept out of search and the sitemap.
export const metadata: Metadata = {
  title: "Account",
  ...pageMetadata({
    title: "Account | WVSU CICT",
    description: "Sign in to your WVSU CICT account.",
  }),
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
