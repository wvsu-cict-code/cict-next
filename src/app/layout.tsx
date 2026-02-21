import "./globals.css";
import Header from "./layout/header";
import Footer from "./layout/footer";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <body >
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
