import { getDictionary } from "@/lib/dictionary";

export default async function LearnPage({ params }: { params: { locale: 'en' | 'vi' } }) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.locale);

  return (
    <main className="flex flex-col items-center justify-center p-8 text-center flex-grow">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">{dict.learn.title}</h1>
      <p className="text-gray-600 max-w-md">{dict.learn.description}</p>
    </main>
  );
}