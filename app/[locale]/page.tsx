import { getDictionary, type Dictionary } from "@/lib/dictionary";
import CubeScene from "@/components/cube/CubeScene";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const dict: Dictionary = await getDictionary(resolvedParams.locale as 'en' | 'vi');

  return (
    <main className="max-w-6xl mx-auto p-8 grid lg:grid-cols-2 gap-12 items-center flex-grow">
      <div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          {(dict.home as Dictionary['home']).title}
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          {(dict.home as Dictionary['home']).subtitle}
        </p>
        <div className="mt-10 flex gap-4">
          <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all">
            Get Started
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-3xl" />
        <CubeScene />
      </div>
    </main>
  );
}