import { getDictionary } from "../../../lib/dictionary";
import { supabase } from "../../../lib/supabase";

export default async function AlgorithmsPage({ params }: { params: { locale: 'en' | 'vi' } }) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.locale);
  const lang = resolvedParams.locale;

  // Let's ask Supabase for all our algorithms
  const { data: algorithms, error } = await supabase
    .from('algorithms')
    .select('*');

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-indigo-600 mb-2">{dict.algorithms.title}</h1>
      <p className="text-gray-600 mb-8">{dict.algorithms.description}</p>

      {/* This is where we loop through the data from the database */}
      <div className="grid gap-4">
        {algorithms?.map((alg) => (
          <div key={alg.id} className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                {/* We use the language from the URL to pick the right column! */}
                <h3 className="text-xl font-bold text-gray-900">
                  {lang === 'vi' ? alg.name_vi : alg.name_en}
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded uppercase tracking-wider">
                  {alg.category}
                </span>
              </div>
              <span className="text-sm text-gray-500 italic">{alg.difficulty}</span>
            </div>
            
            {/* The notation is the most important part */}
            <div className="mt-4 p-3 bg-gray-50 rounded font-mono text-lg text-indigo-900 border border-indigo-50">
              {alg.notation}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}