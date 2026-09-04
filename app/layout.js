import "./globals.css";
import Script from "next/script";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import NotificationToast from "@/components/NotificationToast";

export const metadata = {
  title: "Itran",
  description: "Discover fragrances crafted in silence, designed to speak volumes.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const gaId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HBWMX74JC3";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
        {/* Google Analytics 4 (GA4) Tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <AppProvider>
          <NotificationToast />
          <div className="page-transition hidden"></div>
          <Header />
          <SearchModal />
          <main>{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
