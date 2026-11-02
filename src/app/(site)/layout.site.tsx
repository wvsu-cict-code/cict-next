import { SiteContentPrefetch } from "@/components/SiteContentPrefetch";
import Header from "../layout/header";
import Footer from "../layout/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#content"
        className="focus:bg-theme-red sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteContentPrefetch />
      <Header />
      <main id="content" className="grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
