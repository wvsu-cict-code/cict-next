import { Oswald } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable}`}>
        {/* Temporary header */}
        <header className="flex flex-row gap-x-3 text-lg">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/programs" className="hover:underline">
            Programs
          </Link>
          <Link href="/faculty-profiles" className="hover:underline">
            Faculty
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/news-announcements" className="hover:underline">
            News
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
