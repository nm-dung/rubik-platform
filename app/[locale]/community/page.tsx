import dynamic from "next/dynamic";
import { getDictionary } from "@/lib/dictionary";

const CommunityHub = dynamic(() => import("@/components/community/CommunityHub"), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  ),
  ssr: true,
});

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = await params;
  const locale = routeLocale === 'vi' ? 'vi' : 'en';
  const dict = await getDictionary(locale);

  return <CommunityHub locale={locale} dict={dict} />;
}
