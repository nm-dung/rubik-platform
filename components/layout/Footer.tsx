import type { Dictionary } from "@/lib/dictionary";

export default function Footer({ dict }: { dict: Dictionary['footer'] }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <p>© {currentYear} Rubik's Learning Platform. {dict.rights}</p>
      </div>
    </footer>
  );
}