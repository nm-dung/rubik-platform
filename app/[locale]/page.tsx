import { getDictionary } from '../../lib/dictionary';

// Next.js automatically passes the URL parameters (like 'en' or 'vi') into this component
export default async function Home({ params }: { params: { locale: 'en' | 'vi' } }) {
  // 1. We wait for the URL parameters to be ready (a requirement in the newest Next.js versions)
  const resolvedParams = await params;
  
  // 2. We fetch the correct JSON dictionary based on the URL
  const dict = await getDictionary(resolvedParams.locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
      {/* 3. We inject the text dynamically instead of hardcoding it */}
      <h1 className="text-4xl font-bold">
        {dict.home.title}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        {dict.home.subtitle}
      </p>
    </main>
  );
}