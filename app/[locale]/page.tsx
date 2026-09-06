import { getDictionary, type Dictionary } from "@/lib/dictionary";
import CubeScene from "@/components/cube/CubeScene";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const dict: Dictionary = await getDictionary(resolvedParams.locale as 'en' | 'vi');

  // Check if user is authenticated
  let isAuthenticated = false;
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      isAuthenticated = !!session;
    } catch (error) {
      // Ignore auth errors
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center flex-grow bg-white dark:bg-gray-900 min-h-screen">
      <div className="text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {(dict.home as Dictionary['home']).title}
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
          {(dict.home as Dictionary['home']).subtitle}
        </p>
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          {isAuthenticated ? (
            <Link
              href={`/${resolvedParams.locale}/dashboard`}
              className="px-6 sm:px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all text-center shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 active:scale-95"
            >
              {(dict.home as Dictionary['home']).go_to_dashboard}
            </Link>
          ) : (
            <Link
              href={`/${resolvedParams.locale}/learn`}
              className="px-6 sm:px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all text-center shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 active:scale-95"
            >
              {(dict.home as Dictionary['home']).get_started}
            </Link>
          )}
        </div>
      </div>

      <div className="relative order-first lg:order-last">
        <div className="absolute -inset-4 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl" />
        <CubeScene />
      </div>
    </main>
  );
}