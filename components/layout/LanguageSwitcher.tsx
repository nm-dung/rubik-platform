"use client"; // This tells Next.js this component runs in the browser

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const targetLocale = currentLocale === "en" ? "vi" : "en";
  const targetLabel = currentLocale === "en" ? "VI" : "EN";

  // This safely replaces the first part of the URL (/en/... to /vi/...)
  const redirectedPathname = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <Link 
      href={redirectedPathname(targetLocale)}
      className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
    >
      {targetLabel}
    </Link>
  );
}