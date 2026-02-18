import "./globals.css";
import Header from "./layout/header";
import Footer from "./layout/footer";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
      
        <main style={{ flex: 1 }}>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
