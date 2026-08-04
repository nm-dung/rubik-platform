import { getDictionary, type Dictionary } from "@/lib/dictionary";
import CubeScene from "@/components/cube/CubeScene";
import Link from "next/link";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const dict: Dictionary = await getDictionary(resolvedParams.locale as 'en' | 'vi');

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center flex-grow">
      <div className="text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          {(dict.home as Dictionary['home']).title}
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600">
          {(dict.home as Dictionary['home']).subtitle}
        </p>
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link
            href={`/${resolvedParams.locale}/learn`}
            className="px-6 sm:px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all text-center"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="relative order-first lg:order-last">
        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-3xl" />
        <CubeScene />
      </div>
    </main>
  );
}