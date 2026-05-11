import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getDictionary } from "../../lib/dictionary";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

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
  params: { locale: 'en' | 'vi' };
}>) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.locale);

  return (
    <html lang={resolvedParams.locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        {/* We pass the specific dictionary section and locale to the Navbar */}
        <Navbar dict={dict.nav} locale={resolvedParams.locale} />
        
        {/* The 'children' is whatever page the user is currently looking at */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>

        {/* We pass the specific dictionary section to the Footer */}
        <Footer dict={dict.footer} />
      </body>
    </html>
  );
}