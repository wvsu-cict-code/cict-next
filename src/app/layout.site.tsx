import "./globals.css";
import { Metadata, Viewport } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import {
  SHARE_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
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
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: "West Visayas State University",
  category: "education",
  // Keeps iOS Safari from turning numbers like years and IDs into phone links
  formatDetection: { telephone: false, email: false, address: false },

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
    // Lets Google show the share image large in results and Discover
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Thumbnail for search engines and apps that read it instead of og:image
  other: {
    thumbnail: `${SITE_URL}${SHARE_IMAGE.url}`,
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
