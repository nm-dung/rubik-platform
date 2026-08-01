import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getDictionary } from "../../lib/dictionary";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { ToastContainer } from "../../components/layout/ToastContainer";
import { AuthProvider } from "../../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rubik's Learning Platform",
  description: "Learn to solve the Rubik's Cube effectively.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.locale as 'en' | 'vi');

  return (
    <html lang={resolvedParams.locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <ToastContainer />
          
          <Navbar dict={dict.nav} locale={resolvedParams.locale} />
          
          
          <div className="flex-grow flex flex-col">
            {children}
          </div>

         
          <Footer dict={dict.footer} />
        </AuthProvider>
      </body>
    </html>
  );
}