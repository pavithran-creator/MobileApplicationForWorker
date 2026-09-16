import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "../lib/i18n";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "ON-DEMAND | Tamil Nadu Labour Cooperative Marketplace",
  description: "Civic-trust, cooperative-owned digital service marketplace connecting skilled trades workers with households and institutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <LangProvider>
          <ErrorBoundary>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ErrorBoundary>
        </LangProvider>
      </body>
    </html>
  );
}
