import "./globals.css";
import { Metadata } from "next";

// --- SEO METADATA CONFIGURATION ---
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cict.wvsu.edu.ph";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  
  title: {
    default: 'WVSU CICT',
    template: '%s | CICT', 
  },
  
  description: 'The official website for the College of Information and Communications Technology.',
  
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    siteName: 'WVSU CICT',
    url: siteUrl,
    images: [
      {
        url: '/icons/cictlogo.png', 
        width: 1200,
        height: 630,
        alt: 'WVSU CICT Campus or Logo',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'WVSU CICT',
    description: 'The official website for the College of Information and Communications Technology.',
    images: ['/icons/cictlogo.png'], 
  },

  icons: {
    icon: '/icons/cictlogo.png', 
    apple: '/apple-touch-icon.png', 
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <body className="flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
