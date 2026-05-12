import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

// We define the shape of the dictionary props we expect
type NavbarProps = {
  dict: {
    logo: string;
    learn: string;
    algorithms: string;
    timer?: string; // 1. Added optional timer key to avoid crashes
  };
  locale: string;
};

export default function Navbar({ dict, locale }: NavbarProps) {
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight text-indigo-600">
          {dict.logo}
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={`/${locale}/learn`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.learn}
          </Link>
          <Link href={`/${locale}/algorithms`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.algorithms}
          </Link>
          
          <Link href={`/${locale}/timer`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.timer || "Timer"} 
          </Link>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div> 
          
          <LanguageSwitcher currentLocale={locale} />
        </nav>

      </div>
    </header>
  );
}