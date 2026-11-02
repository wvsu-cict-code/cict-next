import "./globals.css";
import { Metadata, Viewport } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  pageMetadata,
} from "@/lib/seo";

const display = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

// --- SEO METADATA CONFIGURATION ---
// Defaults for every page; pages override them through pageMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: "%s | CICT",
  },
  applicationName: SITE_NAME,

  ...pageMetadata({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  }),

  icons: {
    icon: "/icons/cictlogo.png",
    apple: "/icons/cictlogo.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#102033",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
