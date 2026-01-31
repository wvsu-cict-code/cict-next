import { Oswald } from "next/font/google";
import "./globals.css";
import Header from "./layout/header";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
