import "./globals.css";
import Header from "./layout/header";
import Footer from "./layout/footer";
import { Metadata } from "next";

// --- SEO METADATA CONFIGURATION ---
export const metadata: Metadata = {
// TODO: Replace with the actual URL once deployed
  metadataBase: new URL('https://www.your-cict-domain.edu.ph'), 
  
  title: {
    default: 'WVSU CICT',
    template: '%s | CICT', 
  },
  
  description: 'The official website for the College of Information and Communications Technology.',
  
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    siteName: 'WVSU CICT',
    url: 'https://www.your-cict-domain.edu.ph', // TODO: Replace with the actual URL once deployed
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
        <Header />
        <main className="grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
