import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, container, primaryButton } from "@/components/PageHeader";
import Footer from "./layout/footer";
import Header from "./layout/header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/news-announcements", label: "News and announcements" },
  { href: "/faculty-profiles", label: "Faculty" },
  { href: "/contact", label: "Contact" },
];

/**
 * Unknown URLs. Exported as 404.html for the school site, where .htaccess
 * serves it (ErrorDocument). It sits outside the (site) group, so it brings
 * its own header and footer.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="content" className="grow bg-white">
        <PageHeader
          eyebrow="Error 404"
          title="We couldn't find that page."
          intro="The link may be old, or the page may have moved. Try one of these instead, or search from the top of the page."
        />
        <div className={`${container} py-14 md:py-20`}>
          <ul className="border-rule grid border-t sm:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.href} className="border-rule border-b">
                <Link
                  href={link.href}
                  className="text-ink hover:text-theme-red block py-4 text-lg transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/" className={`${primaryButton} mt-10`}>
            Go to the home page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
