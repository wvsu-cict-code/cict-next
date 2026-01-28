import { Oswald } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./layout/header";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable}`}>
        <Header inter={inter} />
        {children}
      </body>
    </html>
  );
}
