import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "CMS",
    template: "%s | CICT CMS",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The CMS stays light even when a visitor picked dark mode on the site
  return (
    <div data-theme="light" className="text-ink min-h-screen bg-[#f7f8fa]">
      {children}
    </div>
  );
}
