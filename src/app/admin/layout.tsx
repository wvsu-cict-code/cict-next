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
  return <div className="text-ink min-h-screen bg-[#f7f8fa]">{children}</div>;
}
