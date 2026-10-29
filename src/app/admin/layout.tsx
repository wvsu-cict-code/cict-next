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
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      {children}
    </div>
  );
}
