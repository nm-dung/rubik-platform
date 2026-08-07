"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const targetLocale = currentLocale === "en" ? "vi" : "en";
  const targetLabel = currentLocale === "en" ? "VI" : "EN";

 
  const redirectedPathname = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <Link 
      href={redirectedPathname(targetLocale)}
      className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 hover:scale-110 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300"
    >
      {targetLabel}
    </Link>
  );
}