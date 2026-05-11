import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import NotificationToast from "@/components/NotificationToast";

export const metadata = {
  title: "Itran",
  description: "Discover fragrances crafted in silence, designed to speak volumes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
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
